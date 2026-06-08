/**
 * PentAGI - Type Definitions
 * Multi-agent workflow orchestration
 */

import type { BaseWorkspaceState, TokenUsage } from '@/lib/types';

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  model?: string;
  maxIterations?: number;
  tools?: string[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  totalCalls: number;
  successRate: number;
}

export interface FlowStep {
  id: string;
  agentId: string;
  name: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs?: number;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: string;
  totalDurationMs?: number;
  tokenUsage?: TokenUsage;
}

export interface RunFlowRequest {
  name: string;
  description?: string;
  query: string;
  depth?: 'quick' | 'standard' | 'deep';
}

export interface PentAGIWorkspaceState extends BaseWorkspaceState {
  toolId: 'pentagi';
  activeFlows?: string[];
}
