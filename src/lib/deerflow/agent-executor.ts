/**
 * DeerFlow - Agent Executor
 * Core agent loop with tool calling support
 */

import { chatCompletion, webSearch } from '@/lib/ai-sdk';
import { resolveModel } from '@/lib/ai-sdk';
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
  AgentConfig,
  AgentExecutionResult,
  ToolCall,
  Artifact,
} from './types';

// =================== Tool Definitions ===================

interface ToolDefinition {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

const AVAILABLE_TOOLS: Record<string, ToolDefinition> = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for information. Args: { query: string, num?: number }',
    execute: async (args) => {
      const query = args.query as string;
      const num = (args.num as number) || 5;
      const result = await webSearch({ query, num });
      if (isErr(result)) return `Web search failed: ${result.error.message}`;
      const results = result.value;
      return results.map((r, i) => `[${i + 1}] ${r.name}\n${r.snippet}\nURL: ${r.url}`).join('\n\n');
    },
  },
  file_read: {
    name: 'file_read',
    description: 'Read a file from the workspace. Args: { path: string }',
    execute: async (args) => {
      // In a real implementation, this would read from the workspace
      return `File content for: ${args.path} (placeholder - workspace file access)`;
    },
  },
  file_write: {
    name: 'file_write',
    description: 'Write content to a file in the workspace. Args: { path: string, content: string }',
    execute: async (args) => {
      return `File written: ${args.path}`;
    },
  },
};

// =================== Agent Executor ===================

/**
 * Execute an agent with the given configuration and messages.
 * Implements the core agent loop with tool calling support.
 */
export async function executeAgent(
  config: AgentConfig,
  messages: ChatMessage[],
  onToolCall?: (toolCall: ToolCall) => void,
): Promise<Result<AgentExecutionResult>> {
  const allToolCalls: ToolCall[] = [];
  const allArtifacts: Artifact[] = [];
  const totalUsage: TokenUsage = createTokenUsage();

  const enabledTools = config.tools || ['web_search'];
  const maxIterations = config.maxIterations || 10;
  const model = config.model || resolveModel('medium');

  // Build system prompt with tool awareness
  const toolDescriptions = enabledTools
    .map(t => AVAILABLE_TOOLS[t])
    .filter(Boolean)
    .map(t => `- ${t.name}: ${t.description}`)
    .join('\n');

  const enhancedSystemPrompt = `${config.systemPrompt}

## Available Tools
You have access to the following tools:
${toolDescriptions}

To use a tool, include a JSON block in your response in this format:
\`\`\`tool_call
{"name": "tool_name", "arguments": {"key": "value"}}
\`\`\`

You can make multiple tool calls. After receiving tool results, continue your reasoning.
When you have the final answer, respond normally without any tool_call blocks.`;

  // Build the message history
  const conversationMessages: ChatMessage[] = [
    { role: 'system', content: enhancedSystemPrompt },
    ...messages,
  ];

  let iterations = 0;
  let completedNormally = false;
  let lastResponse = '';

  while (iterations < maxIterations) {
    iterations++;

    // Call the LLM
    const result = await chatCompletion({
      messages: conversationMessages,
      model,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
    });

    if (isErr(result)) {
      return err(createToolError(
        `Agent execution failed at iteration ${iterations}: ${result.error.message}`,
        'ai',
        { retryable: true, context: { iteration: iterations } },
      ));
    }

    const response = result.value;
    lastResponse = response.text;
    mergeTokenUsage(totalUsage, response.usage);

    // Parse tool calls from the response
    const parsedToolCalls = parseToolCalls(response.text);

    if (parsedToolCalls.length === 0) {
      // No tool calls - agent is done
      completedNormally = true;
      break;
    }

    // Execute tool calls
    const toolResults: string[] = [];
    for (const tc of parsedToolCalls) {
      const toolDef = AVAILABLE_TOOLS[tc.name];
      const startTime = Date.now();

      const toolCallRecord: ToolCall = {
        id: `tc-${iterations}-${allToolCalls.length}`,
        name: tc.name,
        arguments: JSON.stringify(tc.arguments),
        status: 'pending',
      };

      if (!toolDef) {
        toolCallRecord.status = 'failed';
        toolCallRecord.result = `Unknown tool: ${tc.name}`;
        toolResults.push(`Tool ${tc.name} not found. Available tools: ${enabledTools.join(', ')}`);
      } else {
        try {
          const toolOutput = await toolDef.execute(tc.arguments as Record<string, unknown>);
          toolCallRecord.status = 'completed';
          toolCallRecord.result = toolOutput;
          toolCallRecord.duration = Date.now() - startTime;
          toolResults.push(toolOutput);
        } catch (error) {
          toolCallRecord.status = 'failed';
          toolCallRecord.result = error instanceof Error ? error.message : String(error);
          toolCallRecord.duration = Date.now() - startTime;
          toolResults.push(`Tool error: ${toolCallRecord.result}`);
        }
      }

      allToolCalls.push(toolCallRecord);
      onToolCall?.(toolCallRecord);
    }

    // Add assistant response and tool results to conversation
    conversationMessages.push({ role: 'assistant', content: response.text });
    conversationMessages.push({
      role: 'user',
      content: `Tool results:\n${toolResults.map((r, i) => `[Result ${i + 1}]: ${r}`).join('\n\n')}\n\nContinue with your analysis based on these results.`,
    });

    // Extract artifacts from tool results
    const newArtifacts = extractArtifacts(response.text);
    allArtifacts.push(...newArtifacts);
  }

  if (!completedNormally) {
    lastResponse += '\n\n*[Agent reached maximum iterations. Response may be incomplete.]*';
  }

  return ok({
    response: lastResponse,
    toolCalls: allToolCalls,
    artifacts: allArtifacts,
    tokenUsage: totalUsage,
    iterations,
    completedNormally,
  });
}

// =================== Parsing Helpers ===================

interface ParsedToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Parse tool call blocks from the LLM response.
 * Supports ```tool_call``` code blocks.
 */
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

  // Also try inline JSON tool calls: {"tool": "name", "arguments": {...}}
  if (calls.length === 0) {
    const inlineRegex = /\{"name"\s*:\s*"(\w+)"\s*,\s*"arguments"\s*:\s*(\{[^}]*\})\s*\}/g;
    while ((match = inlineRegex.exec(text)) !== null) {
      try {
        calls.push({
          name: match[1],
          arguments: JSON.parse(match[2]),
        });
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return calls;
}

/**
 * Extract artifacts from the response text.
 * Detects code blocks, reports, and other structured content.
 */
function extractArtifacts(text: string): Artifact[] {
  const artifacts: Artifact[] = [];
  let idCounter = 0;

  // Extract code blocks
  const codeRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = codeRegex.exec(text)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2].trim();
    // Skip tool_call blocks
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

  // Extract report sections (## headings with substantial content)
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
