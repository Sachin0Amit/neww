/**
 * Shannon - Pipeline Engine
 * Orchestrates the 5-phase pentesting pipeline
 */

import {
  type DistributedConfig,
  type WorkspaceState,
  type AgentName,
  type PipelinePhase,
  AGENT_DEFINITIONS,
} from './types';
import { distributeConfig } from './config-parser';
import { PentestError } from './error-handling';
import {
  getWorkspace,
  updateWorkspace,
  updatePhaseStatus,
  addLog,
} from './workspace-manager';
import { executeAgent } from './agent-executor';

// Active pipeline runs (in-memory tracking)
const activePipelines = new Map<string, AbortController>();

/** Start a pipeline run for a workspace */
export async function startPipeline(workspaceName: string): Promise<void> {
  const workspace = await getWorkspace(workspaceName);
  if (!workspace) throw new PentestError('Workspace not found', 'config', false);

  if (workspace.status === 'running') {
    throw new PentestError('Pipeline already running for this workspace', 'validation', false);
  }

  const abortController = new AbortController();
  activePipelines.set(workspaceName, abortController);

  // Update workspace status
  await updateWorkspace(workspaceName, {
    status: 'running',
    currentPhase: 'preflight',
    error: undefined,
  });

  await addLog(workspaceName, 'info', 'Pipeline started');

  // Run pipeline in background
  // Use setImmediate to avoid blocking the API response
  setImmediate(() => {
    runPipelineAsync(workspaceName, workspace, abortController).catch(async (error) => {
      try {
        await updateWorkspace(workspaceName, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date().toISOString(),
        });
        await addLog(workspaceName, 'error', `Pipeline failed: ${error instanceof Error ? error.message : String(error)}`);
      } catch (logError) {
        console.error('[Shannon Pipeline] Failed to log error:', logError);
      }
      activePipelines.delete(workspaceName);
    });
  });
}

/** Stop a running pipeline */
export async function stopPipeline(workspaceName: string): Promise<void> {
  const controller = activePipelines.get(workspaceName);
  if (controller) {
    controller.abort();
    activePipelines.delete(workspaceName);
    await updateWorkspace(workspaceName, {
      status: 'cancelled',
      completedAt: new Date().toISOString(),
    });
    await addLog(workspaceName, 'info', 'Pipeline stopped by user');
  }
}

/** Get pipeline status */
export function isPipelineRunning(workspaceName: string): boolean {
  return activePipelines.has(workspaceName);
}

/** Run the full pipeline asynchronously */
async function runPipelineAsync(
  workspaceName: string,
  workspace: WorkspaceState,
  abortController: AbortController,
): Promise<void> {
  const config = distributeConfig(workspace.config);

  try {
    // Phase 0: Preflight
    await runPhaseWithCheck(workspaceName, 'preflight', abortController, async () => {
      await updateWorkspace(workspaceName, { currentPhase: 'preflight' });
      await addLog(workspaceName, 'info', 'Running preflight checks...');

      // Basic validation
      if (!workspace.targetUrl) {
        throw new PentestError('Target URL is required', 'validation', false);
      }

      // Check if target URL is reachable (basic HTTP check)
      try {
        const response = await fetch(workspace.targetUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000),
        });
        await addLog(workspaceName, 'info', `Target reachable: ${response.status} ${response.statusText}`);
      } catch (e) {
        await addLog(workspaceName, 'warn', `Target URL check: ${e instanceof Error ? e.message : 'Could not reach target'}. Continuing anyway.`);
      }

      await addLog(workspaceName, 'info', 'Preflight checks completed');
    });

    // Phase 1: Pre-Recon
    await runPhaseWithCheck(workspaceName, 'pre-recon', abortController, async () => {
      await updateWorkspace(workspaceName, { currentPhase: 'pre-recon' });
      await runAgentInPipeline(workspaceName, 'pre-recon', workspace.targetUrl, workspace.repoPath, config, abortController);
    });

    // Phase 2: Recon
    await runPhaseWithCheck(workspaceName, 'recon', abortController, async () => {
      await updateWorkspace(workspaceName, { currentPhase: 'recon' });
      await runAgentInPipeline(workspaceName, 'recon', workspace.targetUrl, workspace.repoPath, config, abortController);
    });

    // Phase 3: Vulnerability Analysis (parallel per vuln class)
    await runPhaseWithCheck(workspaceName, 'vuln-analysis', abortController, async () => {
      await updateWorkspace(workspaceName, { currentPhase: 'vuln-analysis' });

      const vulnAgents = config.vuln_classes.map(cls => `${cls}-vuln` as AgentName);
      const maxConcurrent = workspace.config.pipeline?.max_concurrent_pipelines || 5;

      await runAgentsParallel(workspaceName, vulnAgents, workspace.targetUrl, workspace.repoPath, config, maxConcurrent, abortController);
    });

    // Phase 4: Exploitation (conditional, parallel per vuln class)
    if (config.exploit) {
      await runPhaseWithCheck(workspaceName, 'exploitation', abortController, async () => {
        await updateWorkspace(workspaceName, { currentPhase: 'exploitation' });

        const exploitAgents = config.vuln_classes.map(cls => `${cls}-exploit` as AgentName);
        const maxConcurrent = workspace.config.pipeline?.max_concurrent_pipelines || 5;

        await runAgentsParallel(workspaceName, exploitAgents, workspace.targetUrl, workspace.repoPath, config, maxConcurrent, abortController);
      });
    }

    // Phase 5: Report Generation
    await runPhaseWithCheck(workspaceName, 'reporting', abortController, async () => {
      await updateWorkspace(workspaceName, { currentPhase: 'reporting' });
      await runAgentInPipeline(workspaceName, 'report', workspace.targetUrl, workspace.repoPath, config, abortController);
    });

    // Pipeline completed successfully
    const finalWorkspace = await getWorkspace(workspaceName);
    const totalCost = Object.values(finalWorkspace?.agentMetrics || {}).reduce((sum, m) => sum + (m.costUsd || 0), 0);

    // Count findings from deliverables
    const findings = await countFindings(workspaceName);

    await updateWorkspace(workspaceName, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      currentPhase: 'completed',
      cost: totalCost,
      findings,
    });
    await addLog(workspaceName, 'info', `Pipeline completed successfully. Total cost: $${totalCost.toFixed(4)}`);

  } finally {
    activePipelines.delete(workspaceName);
  }
}

/** Run a phase with abort checking */
async function runPhaseWithCheck(
  workspaceName: string,
  phaseName: string,
  abortController: AbortController,
  phaseFn: () => Promise<void>,
): Promise<void> {
  if (abortController.signal.aborted) {
    throw new PentestError('Pipeline cancelled', 'validation', false);
  }

  await updatePhaseStatus(workspaceName, phaseName, 'in_progress');
  await addLog(workspaceName, 'info', `Starting phase: ${phaseName}`);

  try {
    await phaseFn();
    await updatePhaseStatus(workspaceName, phaseName, 'completed');
    await addLog(workspaceName, 'info', `Phase completed: ${phaseName}`);
  } catch (error) {
    if (abortController.signal.aborted) {
      await updatePhaseStatus(workspaceName, phaseName, 'failed');
      throw new PentestError('Pipeline cancelled', 'validation', false);
    }
    await updatePhaseStatus(workspaceName, phaseName, 'failed');
    throw error;
  }
}

/** Run a single agent within the pipeline */
async function runAgentInPipeline(
  workspaceName: string,
  agentName: AgentName,
  targetUrl: string,
  repoPath: string,
  config: DistributedConfig,
  abortController: AbortController,
): Promise<void> {
  if (abortController.signal.aborted) return;

  await updateWorkspace(workspaceName, { currentAgent: agentName });
  const result = await executeAgent(workspaceName, agentName, targetUrl, repoPath, config);

  if (!result.success) {
    throw new PentestError(`Agent ${agentName} failed`, 'validation', true);
  }
}

/** Run multiple agents in parallel with concurrency limit */
async function runAgentsParallel(
  workspaceName: string,
  agentNames: AgentName[],
  targetUrl: string,
  repoPath: string,
  config: DistributedConfig,
  maxConcurrent: number,
  abortController: AbortController,
): Promise<void> {
  const validAgents = agentNames.filter(name =>
    AGENT_DEFINITIONS.some(d => d.name === name)
  );

  // Run in batches
  for (let i = 0; i < validAgents.length; i += maxConcurrent) {
    if (abortController.signal.aborted) return;

    const batch = validAgents.slice(i, i + maxConcurrent);
    await Promise.all(
      batch.map(agentName =>
        runAgentInPipeline(workspaceName, agentName, targetUrl, repoPath, config, abortController)
      ),
    );
  }
}

/** Count findings from deliverables */
async function countFindings(workspaceName: string): Promise<{ critical: number; high: number; medium: number; low: number }> {
  const { listDeliverables, readDeliverable } = await import('./workspace-manager');
  const files = await listDeliverables(workspaceName);

  const findings = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const file of files) {
    if (file.includes('analysis_deliverable') || file.includes('exploitation_evidence')) {
      const content = await readDeliverable(workspaceName, file);
      if (content) {
        // Simple keyword-based counting
        findings.critical += (content.match(/\bCRITICAL\b|\bseverity:\s*critical/gi) || []).length;
        findings.high += (content.match(/\bHIGH\b|\bseverity:\s*high/gi) || []).length;
        findings.medium += (content.match(/\bMEDIUM\b|\bseverity:\s*medium/gi) || []).length;
        findings.low += (content.match(/\bLOW\b|\bseverity:\s*low/gi) || []).length;
      }
    }
  }

  // Normalize counts (avoid double-counting from patterns)
  findings.critical = Math.min(findings.critical, Math.ceil(findings.critical / 3));
  findings.high = Math.min(findings.high, Math.ceil(findings.high / 3));
  findings.medium = Math.min(findings.medium, Math.ceil(findings.medium / 3));
  findings.low = Math.min(findings.low, Math.ceil(findings.low / 3));

  return findings;
}
