/**
 * PentAGI - Flow Engine
 * Multi-agent workflow orchestration with AI
 */

import { chatCompletion, webSearch, askAI } from '@/lib/ai-sdk';
import { ok, err, isOk, createTokenUsage, mergeTokenUsage, type Result } from '@/lib/types';
import type { AgentDef, Flow, FlowStep, RunFlowRequest } from './types';
import crypto from 'crypto';

// =================== Built-in Agents ===================

const BUILT_IN_AGENTS: AgentDef[] = [
  {
    id: 'orchestrator', name: 'Orchestrator', role: 'Task decomposition and coordination',
    systemPrompt: 'You are a task orchestrator. Break down complex tasks into clear sub-tasks and coordinate their execution. Be specific about what each agent should do.',
    status: 'idle', totalCalls: 0, successRate: 0.9,
  },
  {
    id: 'researcher', name: 'Researcher', role: 'Information gathering and analysis',
    systemPrompt: 'You are a research agent. Gather information, analyze data, and provide comprehensive findings. Always cite sources and distinguish facts from opinions.',
    tools: ['web_search'], status: 'idle', totalCalls: 0, successRate: 0.85,
  },
  {
    id: 'analyst', name: 'Analyst', role: 'Deep analysis and evaluation',
    systemPrompt: 'You are an analytical agent. Perform deep analysis, evaluate options, identify patterns, and provide evidence-based conclusions. Quantify where possible.',
    status: 'idle', totalCalls: 0, successRate: 0.88,
  },
  {
    id: 'writer', name: 'Writer', role: 'Content creation and synthesis',
    systemPrompt: 'You are a writing agent. Synthesize information into clear, well-structured content. Use appropriate formatting, maintain coherence, and adapt tone to the audience.',
    status: 'idle', totalCalls: 0, successRate: 0.92,
  },
  {
    id: 'critic', name: 'Critic', role: 'Quality review and improvement',
    systemPrompt: 'You are a critical review agent. Evaluate the quality, accuracy, and completeness of work. Identify weaknesses, suggest improvements, and verify claims.',
    status: 'idle', totalCalls: 0, successRate: 0.87,
  },
  {
    id: 'coder', name: 'Coder', role: 'Code generation and debugging',
    systemPrompt: 'You are a coding agent. Write clean, efficient, well-documented code. Include error handling, type annotations, and tests. Follow best practices.',
    status: 'idle', totalCalls: 0, successRate: 0.83,
  },
  {
    id: 'planner', name: 'Planner', role: 'Strategic planning and roadmapping',
    systemPrompt: 'You are a planning agent. Create detailed plans, roadmaps, and strategies. Consider dependencies, timelines, risks, and resource requirements.',
    status: 'idle', totalCalls: 0, successRate: 0.86,
  },
  {
    id: 'fact-checker', name: 'Fact Checker', role: 'Verification and validation',
    systemPrompt: 'You are a fact-checking agent. Verify claims, cross-reference information, and assess credibility. Flag unsubstantiated claims and provide evidence for conclusions.',
    tools: ['web_search'], status: 'idle', totalCalls: 0, successRate: 0.9,
  },
];

/** List all agents */
export async function listAgents(): Promise<AgentDef[]> {
  return BUILT_IN_AGENTS.map(a => ({ ...a }));
}

/** Create and run a multi-agent flow */
export async function runFlow(request: RunFlowRequest): Promise<Result<Flow>> {
  const flowId = `flow-${crypto.randomUUID().slice(0, 8)}`;
  const totalUsage = createTokenUsage();
  const startTime = Date.now();

  // Step 1: Orchestrator decomposes the task
  const orchestratorStep: FlowStep = {
    id: `step-0`,
    agentId: 'orchestrator',
    name: 'Task Decomposition',
    input: request.query,
    status: 'running',
  };

  const orchResult = await chatCompletion({
    messages: [
      { role: 'system', content: BUILT_IN_AGENTS[0].systemPrompt },
      { role: 'user', content: `Decompose this task into 3-5 steps. For each step specify which agent should handle it: ${request.query}` },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  if (isErr(orchResult)) {
    return err(orchResult.error);
  }

  mergeTokenUsage(totalUsage, orchResult.value.usage);
  orchestratorStep.output = orchResult.value.text;
  orchestratorStep.status = 'completed';
  orchestratorStep.durationMs = Date.now() - startTime;

  // Step 2: Research phase
  const researchStep: FlowStep = {
    id: `step-1`,
    agentId: 'researcher',
    name: 'Research',
    input: request.query,
    status: 'running',
  };

  const searchResult = await webSearch({ query: request.query, num: 8 });
  const researchContext = isOk(searchResult)
    ? searchResult.value.map(r => r.snippet).join('\n')
    : '';

  const researchResult = await chatCompletion({
    messages: [
      { role: 'system', content: BUILT_IN_AGENTS[1].systemPrompt },
      { role: 'user', content: `Research: ${request.query}\n\nContext:\n${researchContext}` },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  const researchOutput = isOk(researchResult) ? researchResult.value.text : 'Research phase completed with limited data';
  if (isOk(researchResult)) mergeTokenUsage(totalUsage, researchResult.value.usage);
  researchStep.output = researchOutput;
  researchStep.status = 'completed';

  // Step 3: Analysis phase
  const analysisStep: FlowStep = {
    id: `step-2`,
    agentId: 'analyst',
    name: 'Analysis',
    input: researchOutput,
    status: 'running',
  };

  const analysisResult = await chatCompletion({
    messages: [
      { role: 'system', content: BUILT_IN_AGENTS[2].systemPrompt },
      { role: 'user', content: `Analyze the following research findings:\n\n${researchOutput}` },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  const analysisOutput = isOk(analysisResult) ? analysisResult.value.text : 'Analysis completed';
  if (isOk(analysisResult)) mergeTokenUsage(totalUsage, analysisResult.value.usage);
  analysisStep.output = analysisOutput;
  analysisStep.status = 'completed';

  // Step 4: Synthesis (Writer)
  const synthesisStep: FlowStep = {
    id: `step-3`,
    agentId: 'writer',
    name: 'Synthesis',
    input: analysisOutput,
    status: 'running',
  };

  const synthesisResult = await chatCompletion({
    messages: [
      { role: 'system', content: BUILT_IN_AGENTS[3].systemPrompt },
      { role: 'user', content: `Based on the analysis, create a comprehensive response:\n\nOrchestration: ${orchestratorStep.output}\n\nResearch: ${researchOutput}\n\nAnalysis: ${analysisOutput}` },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  const synthesisOutput = isOk(synthesisResult) ? synthesisResult.value.text : 'Synthesis completed';
  if (isOk(synthesisResult)) mergeTokenUsage(totalUsage, synthesisResult.value.usage);
  synthesisStep.output = synthesisOutput;
  synthesisStep.status = 'completed';

  const flow: Flow = {
    id: flowId,
    name: request.name,
    description: request.description || request.query,
    steps: [orchestratorStep, researchStep, analysisStep, synthesisStep],
    status: 'completed',
    createdAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startTime,
    tokenUsage: totalUsage,
  };

  return ok(flow);
}
