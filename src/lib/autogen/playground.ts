/**
 * AutoGen - Multi-Agent Playground
 * Interactive multi-agent conversation system
 */

import { chatCompletion, askAI } from '@/lib/ai-sdk';
import { ok, isOk, createTokenUsage, mergeTokenUsage, type Result, type TokenUsage } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface PlaygroundAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
}

export interface ConversationMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string;
}

export interface PlaygroundResult {
  conversation: ConversationMessage[];
  rounds: number;
  tokenUsage: TokenUsage;
  summary: string;
  timestamp: string;
}

export interface AutogenWorkspaceState extends BaseWorkspaceState {
  toolId: 'autogen';
}

const DEFAULT_AGENTS: PlaygroundAgent[] = [
  {
    id: 'assistant', name: 'Assistant', role: 'Main assistant',
    systemPrompt: 'You are a helpful AI assistant. Engage in thoughtful discussion, provide clear explanations, and collaborate with other agents.',
  },
  {
    id: 'critic', name: 'Critic', role: 'Critical reviewer',
    systemPrompt: 'You are a critical thinking agent. Review and critique ideas, identify weaknesses, suggest improvements, and ensure rigor.',
  },
  {
    id: 'creative', name: 'Creative', role: 'Creative thinker',
    systemPrompt: 'You are a creative thinking agent. Propose innovative ideas, think outside the box, and explore unconventional approaches.',
  },
];

/** Run a multi-agent conversation */
export async function runPlayground(
  topic: string,
  rounds: number = 3,
  agents?: PlaygroundAgent[],
): Promise<Result<PlaygroundResult>> {
  const activeAgents = agents || DEFAULT_AGENTS;
  const totalUsage = createTokenUsage();
  const conversation: ConversationMessage[] = [];

  // Initial prompt
  conversation.push({
    id: `msg-0`,
    agentId: 'system',
    agentName: 'System',
    content: `Discussion topic: ${topic}`,
    timestamp: new Date().toISOString(),
  });

  for (let round = 0; round < rounds; round++) {
    for (const agent of activeAgents) {
      const prevMessages = conversation.slice(-6).map(m => `${m.agentName}: ${m.content}`).join('\n');

      const result = await chatCompletion({
        messages: [
          { role: 'system', content: agent.systemPrompt + `\n\nYou are ${agent.name}. Respond concisely (2-3 sentences).` },
          { role: 'user', content: `Previous discussion:\n${prevMessages}\n\nYour turn. Respond to the discussion.` },
        ],
        temperature: 0.8,
        maxTokens: 500,
      });

      if (isOk(result)) {
        mergeTokenUsage(totalUsage, result.value.usage);
        conversation.push({
          id: `msg-${conversation.length}`,
          agentId: agent.id,
          agentName: agent.name,
          content: result.value.text,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // Generate summary
  const summaryResult = await askAI(
    `Summarize this multi-agent discussion in 2-3 sentences:\n${conversation.map(m => `${m.agentName}: ${m.content}`).join('\n')}`,
    'Be concise.',
    'small',
  );

  return ok({
    conversation,
    rounds,
    tokenUsage: totalUsage,
    summary: isOk(summaryResult) ? summaryResult.value.text : 'Multi-agent discussion completed',
    timestamp: new Date().toISOString(),
  });
}

/** List default agents */
export async function listAgents(): Promise<PlaygroundAgent[]> {
  return DEFAULT_AGENTS;
}
