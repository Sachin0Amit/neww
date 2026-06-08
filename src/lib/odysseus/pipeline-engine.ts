/**
 * Odysseus - Data Pipeline Engine
 * AI-powered data pipeline orchestration
 */

import { chatCompletion, webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, createTokenUsage, mergeTokenUsage, type Result, type TokenUsage } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface PipelineStep {
  id: string;
  name: string;
  type: 'extract' | 'transform' | 'analyze' | 'load';
  config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  durationMs?: number;
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  tokenUsage: TokenUsage;
  createdAt: string;
  totalDurationMs?: number;
}

export interface OdysseusWorkspaceState extends BaseWorkspaceState {
  toolId: 'odysseus';
}

/** Create and run a data pipeline */
export async function runPipeline(
  query: string,
  pipelineName?: string,
): Promise<Result<DataPipeline>> {
  const totalUsage = createTokenUsage();
  const startTime = Date.now();
  const pipelineId = `pipe-${crypto.randomUUID().slice(0, 8)}`;

  // AI designs the pipeline
  const designResult = await askAI(
    `Design a data pipeline for: ${query}

Create 3-5 pipeline steps (extract, transform, analyze, load).
Return ONLY valid JSON array:
[{"id":"step-1","name":"...","type":"extract","config":{"source":"...","query":"..."}}]`,
    'You are a data pipeline architect. Return only valid JSON array.',
    'small',
  );

  let steps: PipelineStep[] = [];
  if (isOk(designResult)) {
    try {
      const text = designResult.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      steps = JSON.parse(text).map((s: any) => ({ ...s, status: 'pending' as const }));
      mergeTokenUsage(totalUsage, designResult.value.usage);
    } catch {
      steps = [
        { id: 'step-1', name: 'Extract Data', type: 'extract', config: { source: 'web', query }, status: 'pending' },
        { id: 'step-2', name: 'Analyze', type: 'analyze', config: { method: 'ai' }, status: 'pending' },
        { id: 'step-3', name: 'Generate Report', type: 'load', config: { format: 'markdown' }, status: 'pending' },
      ];
    }
  }

  // Execute steps
  let context = '';
  for (const step of steps) {
    step.status = 'running';
    const stepStart = Date.now();

    try {
      if (step.type === 'extract') {
        const searchQuery = (step.config.query as string) || query;
        const searchResult = await webSearch({ query: searchQuery, num: 8 });
        step.output = isOk(searchResult)
          ? searchResult.value.map(r => `${r.name}: ${r.snippet}`).join('\n')
          : 'No data extracted';
      } else if (step.type === 'transform' || step.type === 'analyze') {
        const result = await askAI(
          `Process this data (${step.type}):\n${context.slice(0, 3000)}\n\nStep: ${step.name}`,
          'Data processing expert.',
          'small',
        );
        step.output = isOk(result) ? result.value.text : 'Processing failed';
      } else {
        step.output = context;
      }

      step.status = 'completed';
      context += `\n${step.output}`;
    } catch {
      step.status = 'failed';
      step.output = 'Step failed';
    }

    step.durationMs = Date.now() - stepStart;
  }

  return ok({
    id: pipelineId,
    name: pipelineName || `Pipeline for: ${query.slice(0, 50)}`,
    description: query,
    steps,
    status: steps.every(s => s.status === 'completed') ? 'completed' : 'failed',
    tokenUsage: totalUsage,
    createdAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startTime,
  });
}
