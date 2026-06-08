/**
 * Dexter - Agent Loop
 * Core financial research agent with iterative tool calling
 */

import { chatCompletion, resolveModel } from '@/lib/ai-sdk';
import {
  type Result,
  type ChatMessage,
  type TokenUsage,
  ok,
  err,
  isErr,
  createTokenUsage,
  mergeTokenUsage,
  createToolError,
} from '@/lib/types';
import type {
  QueryRequest,
  QueryResponse,
  ToolCallRecord,
  Artifact,
} from './types';
import { FINANCIAL_TOOLS, getToolById } from './financial-tools';
import { buildMemoryContext, extractAndStoreMemory } from './memory';
import { getSkillsPrompt } from './skills';
import { loadSettings } from './settings';

// =================== Mode Prompts ===================

const MODE_PROMPTS: Record<string, string> = {
  default: `You are Dexter, an autonomous financial research agent. You decompose complex financial questions into research steps, execute them using your financial tools, validate your work, and iterate until you have a confident answer.

Your capabilities:
- Real-time stock and crypto price data
- Financial statements (income, balance sheet, cash flow)
- Key financial ratios and earnings data
- SEC filings (10-K, 10-Q, 8-K)
- Stock screening based on criteria
- Company news and insider trading data
- Web search for any additional information

Guidelines:
- Always cite specific numbers and data sources
- Distinguish between facts, estimates, and opinions
- If data seems inconsistent, verify with additional searches
- Present findings in a clear, structured format
- Note the date/time of data when relevant`,

  research: `You are Dexter in Deep Research mode. You conduct comprehensive multi-source financial research.

Approach:
1. Decompose the research question into sub-questions
2. Search for each sub-question systematically
3. Cross-reference findings across multiple sources
4. Identify contradictions and gaps in available information
5. Conduct additional searches to fill gaps
6. Verify key claims independently
7. Rate confidence for each finding
8. Synthesize into a comprehensive research report

Be thorough and skeptical. Distinguish between strong evidence and speculation.`,

  analysis: `You are Dexter in Analysis mode. You perform in-depth financial analysis.

Approach:
1. Gather all relevant financial data (statements, ratios, earnings, filings)
2. Analyze trends and patterns in the data
3. Compare against industry benchmarks and competitors
4. Identify strengths, weaknesses, opportunities, and threats
5. Assess valuation using multiple methodologies
6. Identify key risks and catalysts
7. Form a data-driven conclusion with confidence level

Always show your calculations. State assumptions clearly. Quantify risks where possible.`,
};

// =================== Tool Call Parsing ===================

interface ParsedToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

function parseToolCalls(text: string): ParsedToolCall[] {
  const calls: ParsedToolCall[] = [];

  // Match ```tool_call ... ``` blocks
  const toolCallRegex = /```tool_call\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = toolCallRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.name && typeof parsed.name === 'string') {
        calls.push({
          name: parsed.name,
          arguments: parsed.arguments || parsed.args || {},
        });
      }
    } catch {
      // Skip malformed JSON
    }
  }

  // Also try inline: {"tool": "name", "arguments": {...}}
  if (calls.length === 0) {
    const inlineRegex = /\{"name"\s*:\s*"(\w+)"\s*,\s*"arguments"\s*:\s*(\{[^}]*\})\s*\}/g;
    while ((match = inlineRegex.exec(text)) !== null) {
      try {
        calls.push({
          name: match[1],
          arguments: JSON.parse(match[2]),
        });
      } catch {
        // Skip
      }
    }
  }

  return calls;
}

// =================== Artifact Extraction ===================

function extractArtifacts(text: string): Artifact[] {
  const artifacts: Artifact[] = [];
  let idCounter = 0;

  // Extract code blocks
  const codeRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(text)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2].trim();
    if (lang === 'tool_call') continue;

    idCounter++;
    artifacts.push({
      id: `artifact-code-${idCounter}`,
      type: 'code',
      title: `Code (${lang})`,
      content: code,
      createdAt: new Date().toISOString(),
    });
  }

  // Extract report sections
  const sectionRegex = /##\s+(.+)\n([\s\S]*?)(?=\n##\s|\n*$)/g;
  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    if (content.length > 200) {
      idCounter++;
      artifacts.push({
        id: `artifact-report-${idCounter}`,
        type: 'report',
        title,
        content,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return artifacts;
}

// =================== Agent Loop ===================

/**
 * Execute the Dexter agent loop.
 * Iteratively calls LLM and tools until a final answer is reached.
 */
export async function executeDexterAgent(
  request: QueryRequest,
): Promise<Result<QueryResponse>> {
  const settings = await loadSettings();
  const allToolCalls: ToolCallRecord[] = [];
  const allArtifacts: Artifact[] = [];
  const totalUsage: TokenUsage = createTokenUsage();
  const mode = request.mode || 'default';

  // Build system prompt
  const toolDescriptions = FINANCIAL_TOOLS
    .map(t => `- ${t.id}: ${t.description}`)
    .join('\n');

  let systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.default;

  // Add skills if specified
  if (request.skills && request.skills.length > 0) {
    const skillsPrompt = await getSkillsPrompt(request.skills);
    systemPrompt += skillsPrompt;
  }

  // Add memory context
  const memoryContext = await buildMemoryContext(request.message);
  if (memoryContext) {
    systemPrompt += `\n${memoryContext}`;
  }

  // Add tool instructions
  systemPrompt += `

## Available Tools
You have access to the following financial tools:
${toolDescriptions}

To use a tool, include a JSON block in your response in this format:
\`\`\`tool_call
{"name": "tool_name", "arguments": {"key": "value"}}
\`\`\`

You can make multiple tool calls. After receiving tool results, continue your reasoning.
When you have the final answer, respond normally without any tool_call blocks.`;

  // Add context if provided
  if (request.context) {
    systemPrompt += `\n\n## Additional Context\n${request.context}`;
  }

  // Build conversation
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: request.message },
  ];

  const maxIterations = settings.maxIterations || 10;
  let iterations = 0;
  let completedNormally = false;
  let lastResponse = '';
  const agentsInvoked = ['Dexter-Orchestrator'];

  while (iterations < maxIterations) {
    iterations++;

    const result = await chatCompletion({
      messages,
      model: settings.model || resolveModel('medium'),
      temperature: settings.temperature ?? 0.7,
      maxTokens: 4096,
    });

    if (isErr(result)) {
      return err(createToolError(
        `Agent execution failed at iteration ${iterations}: ${result.error.message}`,
        'ai',
        { retryable: true },
      ));
    }

    const response = result.value;
    lastResponse = response.text;
    mergeTokenUsage(totalUsage, response.usage);

    // Parse tool calls
    const parsedToolCalls = parseToolCalls(response.text);

    if (parsedToolCalls.length === 0) {
      completedNormally = true;
      break;
    }

    // Execute tool calls
    const toolResults: string[] = [];
    for (const tc of parsedToolCalls) {
      const toolDef = getToolById(tc.name);
      const startTime = Date.now();

      const toolCallRecord: ToolCallRecord = {
        id: `tc-${iterations}-${allToolCalls.length}`,
        name: tc.name,
        arguments: JSON.stringify(tc.arguments),
        status: 'pending',
      };

      if (!toolDef) {
        toolCallRecord.status = 'failed';
        toolCallRecord.result = `Unknown tool: ${tc.name}`;
        toolResults.push(`Tool ${tc.name} not found. Available: ${FINANCIAL_TOOLS.map(t => t.id).join(', ')}`);
      } else {
        try {
          const toolOutput = await toolDef.execute(tc.arguments);
          toolCallRecord.status = 'completed';
          toolCallRecord.result = toolOutput.slice(0, 2000);
          toolCallRecord.duration = Date.now() - startTime;
          toolResults.push(toolOutput);

          if (!agentsInvoked.includes(toolDef.name)) {
            agentsInvoked.push(toolDef.name);
          }
        } catch (error) {
          toolCallRecord.status = 'failed';
          toolCallRecord.result = error instanceof Error ? error.message : String(error);
          toolCallRecord.duration = Date.now() - startTime;
          toolResults.push(`Tool error: ${toolCallRecord.result}`);
        }
      }

      allToolCalls.push(toolCallRecord);
    }

    // Add to conversation
    messages.push({ role: 'assistant', content: response.text });
    messages.push({
      role: 'user',
      content: `Tool results:\n${toolResults.map((r, i) => `[Result ${i + 1}]: ${r.slice(0, 1500)}`).join('\n\n')}\n\nContinue your analysis based on these results.`,
    });

    // Extract artifacts
    const newArtifacts = extractArtifacts(response.text);
    allArtifacts.push(...newArtifacts);

    // Context compaction if getting too long
    if (messages.length > 20) {
      const compacted = await compactContext(messages, settings.fastModel);
      if (compacted) {
        messages.length = 2; // Keep system + first user message
        messages.push({ role: 'assistant', content: `[Previous context compacted]\n${compacted}` });
      }
    }
  }

  if (!completedNormally) {
    lastResponse += '\n\n*[Agent reached maximum iterations. Analysis may be incomplete.]*';
  }

  // Extract memories in background
  extractAndStoreMemory(request.message, lastResponse).catch(() => {});

  return ok({
    response: lastResponse,
    mode,
    agentsInvoked,
    toolCalls: allToolCalls,
    artifacts: allArtifacts,
    tokenUsage: totalUsage,
    timestamp: new Date().toISOString(),
  });
}

// =================== Context Compaction ===================

async function compactContext(messages: ChatMessage[], fastModel?: string): Promise<string | null> {
  try {
    const { askAI } = await import('@/lib/ai-sdk');
    const conversationText = messages
      .slice(2) // Skip system + first user message
      .map(m => `${m.role}: ${m.content.slice(0, 500)}`)
      .join('\n');

    const result = await askAI(
      `Summarize the key findings, data, and progress from this conversation. Preserve specific numbers, ticker symbols, and factual findings. Output a concise summary in 500 words or less.\n\n${conversationText}`,
      'You are a context compaction assistant. Preserve all key financial data and facts.',
      'small',
    );

    return result.ok ? (result as any).value?.text || null : null;
  } catch {
    return null;
  }
}
