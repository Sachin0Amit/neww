/**
 * DeerFlow - Chat API Route
 * Real implementation: orchestrates agent execution with memory and skills.
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAgent } from '@/lib/deerflow/agent-executor';
import { getOrCreateThread, addMessage, getRecentChatMessages } from '@/lib/deerflow/thread-manager';
import { getSkillsPrompt, discoverSkills, listSkills } from '@/lib/deerflow/skills-registry';
import { buildMemoryContext, extractAndStoreMemory } from '@/lib/deerflow/memory-manager';
import { isErr, createTokenUsage, mergeTokenUsage } from '@/lib/types';
import type { ChatRequest, ChatResponse, AgentConfig } from '@/lib/deerflow/types';
import type { TokenUsage } from '@/lib/types';

// =================== System Prompt Templates ===================

const MODE_PROMPTS: Record<string, string> = {
  general: `You are DeerFlow, a versatile AI assistant capable of orchestrating multiple specialized agents.
You help users with a wide range of tasks by leveraging your tool-use capabilities.
When appropriate, use web search to find current information.
Be thorough, accurate, and helpful in your responses.
Structure your answers clearly with headings and bullet points when appropriate.`,

  research: `You are DeerFlow in Research Mode, a deep research assistant.
Your approach should be:
1. Decompose the research question into sub-questions
2. Search for each sub-question systematically using web_search
3. Cross-reference and verify findings across multiple sources
4. Identify contradictions and gaps in available information
5. Synthesize findings into a comprehensive report with citations
6. Rate confidence levels for each finding

Always cite your sources. Use multiple searches to cross-reference.
Be methodical and thorough in your research process.`,

  code: `You are DeerFlow in Code Mode, a software development assistant.
Your approach should be:
1. Understand the requirements and constraints
2. Design the solution architecture
3. Implement clean, well-documented code
4. Include proper error handling and edge cases
5. Follow language-specific best practices
6. Suggest test cases for critical functionality

Always provide complete, runnable code — not pseudocode.
Include import statements and necessary setup.`,
};

// =================== POST Handler ===================

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ChatRequest = await req.json();
    const { message, threadId, mode = 'general', skills, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    // 1. Create or reuse a thread
    const thread = await getOrCreateThread(threadId, {
      initialMessage: message,
      mode,
    });

    // 2. Determine active skills
    let activeSkillIds = skills || [];

    // Auto-discover relevant skills if none specified
    if (activeSkillIds.length === 0) {
      const discovered = await discoverSkills(message);
      // Only auto-activate skills that are already enabled
      activeSkillIds = discovered.filter(s => s.enabled).map(s => s.id);
    }

    // 3. Build system prompt
    const basePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.general;
    const skillsPrompt = await getSkillsPrompt(activeSkillIds);
    const memoryContext = await buildMemoryContext(thread.id, message);

    // Get skill names for the response
    const allSkills = await listSkills();
    const activeSkillNames = allSkills
      .filter(s => activeSkillIds.includes(s.id) && s.enabled)
      .map(s => s.name);

    const fullSystemPrompt = [
      basePrompt,
      skillsPrompt,
      memoryContext,
      context ? `\n## Additional Context\n${context}` : '',
    ].filter(Boolean).join('\n\n');

    // 4. Build the agent config
    const tools = mode === 'research'
      ? ['web_search', 'file_read', 'file_write']
      : mode === 'code'
        ? ['web_search', 'file_read', 'file_write']
        : ['web_search'];

    const agentConfig: AgentConfig = {
      name: `deerflow-${mode}`,
      systemPrompt: fullSystemPrompt,
      tools,
      maxIterations: mode === 'research' ? 8 : mode === 'code' ? 6 : 5,
      temperature: mode === 'research' ? 0.3 : mode === 'code' ? 0.2 : 0.7,
      maxTokens: 4096,
    };

    // 5. Get conversation history
    const history = await getRecentChatMessages(thread.id, 20);

    // Add the current user message if not already in history
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.content !== message) {
      // The thread was created with this message already appended,
      // but we need it in the ChatMessage array for the agent
      history.push({ role: 'user', content: message });
    }

    // 6. Execute the agent
    const result = await executeAgent(agentConfig, history);

    if (isErr(result)) {
      console.error('[DeerFlow Chat] Agent execution failed:', result.error.message);

      // Still add the user message if thread was just created
      // Return a graceful error
      return NextResponse.json(
        {
          error: 'Agent execution failed',
          details: result.error.message,
          threadId: thread.id,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    const execution = result.value;

    // 7. Save messages to the thread
    // If thread was created fresh, user message was already saved via initialMessage.
    // If thread existed, we need to save it.
    if (threadId) {
      // Existing thread — add the user message
      await addMessage(thread.id, 'user', message);
    }

    // Save assistant response
    const assistantMessage = await addMessage(thread.id, 'assistant', execution.response, {
      toolCalls: execution.toolCalls.length > 0 ? execution.toolCalls : undefined,
      artifacts: execution.artifacts.length > 0 ? execution.artifacts : undefined,
      tokenUsage: execution.tokenUsage,
    });

    // 8. Extract and store memory from this conversation (non-blocking)
    extractAndStoreMemory(thread.id, message, execution.response).catch(() => {
      // Silent failure — memory extraction must not break the response
    });

    // 9. Build the response
    const chatResponse: ChatResponse = {
      response: execution.response,
      threadId: thread.id,
      messageId: assistantMessage.id,
      mode,
      agentsInvoked: [
        'DeerFlow Orchestrator',
        mode === 'research' ? 'Research Agent' : mode === 'code' ? 'Code Agent' : 'General Agent',
        ...activeSkillNames,
      ],
      toolCalls: execution.toolCalls,
      artifacts: execution.artifacts,
      tokenUsage: execution.tokenUsage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('[DeerFlow Chat] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'Chat failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
