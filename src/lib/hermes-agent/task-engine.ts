/**
 * Hermes Agent - Autonomous Task Execution
 * AI agent that breaks down and executes complex tasks
 */

import { chatCompletion, webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, createTokenUsage, mergeTokenUsage, type Result, type TokenUsage } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface TaskStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  durationMs?: number;
}

export interface TaskExecution {
  id: string;
  query: string;
  steps: TaskStep[];
  finalResult: string;
  tokenUsage: TokenUsage;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  totalDurationMs?: number;
}

export interface HermesWorkspaceState extends BaseWorkspaceState {
  toolId: 'hermes-agent';
}

/** Execute a complex task by breaking it into steps */
export async function executeTask(query: string): Promise<Result<TaskExecution>> {
  const totalUsage = createTokenUsage();
  const startTime = Date.now();
  const taskId = `task-${crypto.randomUUID().slice(0, 8)}`;

  // Step 1: Plan
  const planResult = await askAI(
    `Break this task into 3-5 concrete steps. For each step, describe what needs to be done.
Task: ${query}

Return ONLY valid JSON array:
[{"id":"step-1","description":"..."}]`,
    'You are a task planning agent. Create actionable steps. Return only valid JSON array.',
    'small',
  );

  let steps: TaskStep[] = [];
  if (isOk(planResult)) {
    try {
      const text = planResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      steps = JSON.parse(text).map((s: any) => ({ ...s, status: 'pending' as const }));
      mergeTokenUsage(totalUsage, planResult.value.usage);
    } catch {
      steps = [{ id: 'step-1', description: query, status: 'pending' }];
    }
  } else {
    steps = [{ id: 'step-1', description: query, status: 'pending' }];
  }

  // Step 2: Execute each step
  let combinedOutput = '';
  for (const step of steps) {
    step.status = 'running';
    const stepStart = Date.now();

    // Search for context
    const searchResult = await webSearch({ query: step.description, num: 5 });
    const context = isOk(searchResult)
      ? searchResult.value.map(r => r.snippet).join('\n')
      : '';

    const execResult = await chatCompletion({
      messages: [
        { role: 'system', content: 'You are a task execution agent. Complete the assigned step thoroughly and concisely.' },
        { role: 'user', content: `Task step: ${step.description}\n\nPrevious context: ${combinedOutput.slice(-500)}\n\nResearch: ${context}` },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (isOk(execResult)) {
      mergeTokenUsage(totalUsage, execResult.value.usage);
      step.output = execResult.value.text;
      step.status = 'completed';
      combinedOutput += `\n${step.output}`;
    } else {
      step.status = 'failed';
      step.output = 'Step execution failed';
    }

    step.durationMs = Date.now() - stepStart;
  }

  // Step 3: Synthesize final result
  const synthResult = await askAI(
    `Based on these step results, provide a comprehensive answer to the original task.
Original task: ${query}

Step results:
${steps.map(s => `${s.description}: ${s.output || 'N/A'}`).join('\n')}`,
    'Synthesize the results into a clear, comprehensive answer.',
    'medium',
  );

  const finalResult = isOk(synthResult) ? synthResult.value.text : combinedOutput;
  if (isOk(synthResult)) mergeTokenUsage(totalUsage, synthResult.value.usage);

  return ok({
    id: taskId,
    query,
    steps,
    finalResult,
    tokenUsage: totalUsage,
    status: 'completed',
    createdAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startTime,
  });
}
