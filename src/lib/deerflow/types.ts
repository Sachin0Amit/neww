/**
 * DeerFlow - Type Definitions
 * Multi-agent orchestration system types
 */

import type { BaseWorkspaceState, TokenUsage } from '@/lib/types';

// =================== Thread & Message Types ===================

/** A conversation thread */
export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  status: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

/** A message within a thread */
export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt: string;
  toolCalls?: ToolCall[];
  artifacts?: Artifact[];
  tokenUsage?: TokenUsage;
}

/** A tool call made by the agent */
export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: 'pending' | 'completed' | 'failed';
  duration?: number;
}

/** An artifact produced during agent execution */
export interface Artifact {
  id: string;
  type: 'text' | 'code' | 'image' | 'report' | 'slide' | 'data';
  title: string;
  content: string;
  createdAt: string;
}

// =================== Agent Configuration ===================

/** Agent configuration for execution */
export interface AgentConfig {
  /** Agent name identifier */
  name: string;
  /** System prompt for the agent */
  systemPrompt: string;
  /** Model tier or specific model ID */
  model?: string;
  /** Available tools for this agent */
  tools?: string[];
  /** Maximum iterations for agent loop */
  maxIterations: number;
  /** Temperature for generation */
  temperature?: number;
  /** Max tokens for response */
  maxTokens?: number;
}

// =================== Skill System ===================

/** A DeerFlow skill definition */
export interface Skill {
  id: string;
  name: string;
  description: string;
  /** System prompt modifier when skill is active */
  prompt: string;
  /** Whether the skill is enabled */
  enabled: boolean;
  /** Skill category */
  category: 'research' | 'generation' | 'analysis' | 'code' | 'creative';
  /** Whether this is a built-in skill */
  isBuiltIn: boolean;
  /** Creation timestamp */
  createdAt: string;
}

// =================== Sub-Agent Types ===================

/** Sub-agent type classification */
export type SubAgentType = 'researcher' | 'analyst' | 'writer' | 'coder' | 'reviewer';

/** Configuration for spawning a sub-agent */
export interface SubAgentConfig {
  /** Type of sub-agent */
  type: SubAgentType;
  /** Specific prompt/instruction for the sub-agent */
  prompt: string;
  /** Timeout in milliseconds */
  timeout: number;
  /** Optional context to inject */
  context?: string;
}

/** Result from a sub-agent execution */
export interface SubAgentResult {
  success: boolean;
  output: string;
  toolCalls: ToolCall[];
  tokenUsage: TokenUsage;
  error?: string;
  duration: number;
}

// =================== Memory System ===================

/** A memory entry for persistent context */
export interface MemoryEntry {
  key: string;
  value: string;
  /** Confidence score 0-1 */
  confidence: number;
  /** When this memory was created/updated */
  timestamp: string;
  /** Source of this memory */
  source: 'user' | 'agent' | 'system';
  /** Relevance tags for retrieval */
  tags?: string[];
}

/** Memory store for a thread */
export interface MemoryStore {
  threadId: string;
  entries: MemoryEntry[];
  updatedAt: string;
}

// =================== Agent Execution Result ===================

/** Result from agent execution loop */
export interface AgentExecutionResult {
  /** Final response text */
  response: string;
  /** All tool calls made during execution */
  toolCalls: ToolCall[];
  /** Artifacts produced */
  artifacts: Artifact[];
  /** Total token usage */
  tokenUsage: TokenUsage;
  /** Number of iterations used */
  iterations: number;
  /** Whether the agent completed normally or hit max iterations */
  completedNormally: boolean;
}

// =================== Workspace State ===================

/** DeerFlow workspace state extending BaseWorkspaceState */
export interface DeerFlowWorkspaceState extends BaseWorkspaceState {
  /** Thread ID associated with this workspace */
  threadId?: string;
  /** Messages in this thread */
  messages?: Message[];
  /** Active skill IDs */
  activeSkills?: string[];
  /** Agent configuration */
  agentConfig?: AgentConfig;
  /** Sub-agents currently running */
  activeSubAgents?: string[];
  /** Research depth level */
  depth?: 'quick' | 'standard' | 'deep';
}

// =================== API Request/Response Types ===================

/** Chat request body */
export interface ChatRequest {
  message: string;
  threadId?: string;
  mode?: 'general' | 'research' | 'code';
  skills?: string[];
  context?: string;
}

/** Chat response */
export interface ChatResponse {
  response: string;
  threadId: string;
  messageId: string;
  mode: string;
  agentsInvoked: string[];
  toolCalls: ToolCall[];
  artifacts: Artifact[];
  tokenUsage: TokenUsage;
  timestamp: string;
}

/** Create thread request */
export interface CreateThreadRequest {
  title?: string;
  mode?: 'general' | 'research' | 'code';
}

/** Create skill request */
export interface CreateSkillRequest {
  name: string;
  description: string;
  prompt: string;
  category: Skill['category'];
}
