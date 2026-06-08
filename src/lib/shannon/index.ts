/**
 * Shannon - Barrel Export
 * Re-exports all modules
 */

export * from './types';
export { PentestError, handlePromptError, isRetryableError, classifyError } from './error-handling';
export { resolveModel, getModelDisplayName, supportsAdaptiveThinking, type ModelTier } from './models';
export { parseConfig, validateConfig, distributeConfig, configToYaml } from './config-parser';
export {
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  addLog,
  getLogs,
  saveDeliverable,
  readDeliverable,
  listDeliverables,
  workspaceDeliverablesDir,
  updateAgentProgress,
  updatePhaseStatus,
  addAgentMetrics,
} from './workspace-manager';
export { executeAgent } from './agent-executor';
export { startPipeline, stopPipeline, isPipelineRunning } from './pipeline';
export { parseFindings } from './findings-renderer';
