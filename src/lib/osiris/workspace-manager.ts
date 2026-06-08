/**
 * OSIRIS - Workspace Manager
 *
 * Extends BaseTool to provide workspace persistence for OSIRIS operations.
 * Stores workspaces as JSON files under /home/z/my-project/workspaces/osiris/.
 * Tracks recon results, threat scores, AI analyses, entities, and threat intel per workspace.
 */

import { BaseTool } from '@/lib/base-tool';
import {
  ok,
  err,
  isErr,
  createToolError,
  createProgress,
  createTokenUsage,
} from '@/lib/types';
import type { Result } from '@/lib/types';
import type {
  OsirisWorkspaceState,
  ReconResult,
  CompositeThreatScore,
  AIAnalysis,
  IntelEntity,
  ThreatIntel,
  IntelDomain,
} from './types';

// =================== OSIRIS Tool ===================

class OsirisWorkspaceManager extends BaseTool<OsirisWorkspaceState> {
  readonly toolId = 'osiris';
  readonly toolName = 'OSIRIS OSINT Intelligence';
}

/** Singleton instance */
const manager = new OsirisWorkspaceManager();

// =================== Public API ===================

/** Return type for createWorkspace - includes both state and directory name */
export interface CreatedWorkspace {
  state: OsirisWorkspaceState;
  workspaceName: string;
}

/**
 * Create a new OSIRIS workspace for a target.
 * Returns both the workspace state and the directory name for subsequent operations.
 */
export async function createWorkspace(
  target: string,
  domain?: IntelDomain,
): Promise<Result<CreatedWorkspace>> {
  const workspaceName = manager.generateWorkspaceName('recon');
  const now = new Date().toISOString();

  const initialState: Partial<OsirisWorkspaceState> & { name: string } = {
    name: `OSIRIS: ${target}`,
    target,
    domain: domain ?? 'CYBER',
    toolId: 'osiris',
    status: 'initializing',
    reconResults: [],
    entities: [],
    threatIntel: [],
    progress: createProgress('Workspace created', 0, 1),
    tokenUsage: createTokenUsage(),
    metadata: {
      createdAt: now,
    },
  };

  const result = await manager.initWorkspace(workspaceName, initialState);
  if (isErr(result)) return err(result.error);

  return ok({ state: result.value, workspaceName });
}

/**
 * Get a workspace by its name (directory name).
 */
export async function getWorkspace(
  workspaceName: string,
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.readState(workspaceName);
}

/**
 * Get a workspace by its ID (the id field in the state).
 * Searches all workspaces to find the one matching the ID.
 */
export async function getWorkspaceById(
  workspaceId: string,
): Promise<Result<OsirisWorkspaceState | null>> {
  const listResult = await listWorkspaces();
  if (isErr(listResult)) return err(listResult.error);

  const found = listResult.value.find(ws => ws.id === workspaceId);
  return ok(found ?? null);
}

/**
 * List all OSIRIS workspaces.
 */
export async function listWorkspaces(): Promise<Result<OsirisWorkspaceState[]>> {
  return manager.listWorkspaces();
}

/**
 * Update recon results for a workspace.
 */
export async function updateReconResults(
  workspaceName: string,
  reconResults: ReconResult[],
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.updateState(workspaceName, { reconResults } as Partial<OsirisWorkspaceState>);
}

/**
 * Update threat score for a workspace.
 */
export async function updateThreatScore(
  workspaceName: string,
  threatScore: CompositeThreatScore,
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.updateState(workspaceName, { threatScore } as Partial<OsirisWorkspaceState>);
}

/**
 * Update AI analysis for a workspace.
 */
export async function updateAIAnalysis(
  workspaceName: string,
  aiAnalysis: AIAnalysis,
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.updateState(workspaceName, { aiAnalysis } as Partial<OsirisWorkspaceState>);
}

/**
 * Update entities for a workspace.
 */
export async function updateEntities(
  workspaceName: string,
  entities: IntelEntity[],
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.updateState(workspaceName, { entities } as Partial<OsirisWorkspaceState>);
}

/**
 * Update threat intel for a workspace.
 */
export async function updateThreatIntel(
  workspaceName: string,
  threatIntel: ThreatIntel[],
): Promise<Result<OsirisWorkspaceState | null>> {
  return manager.updateState(workspaceName, { threatIntel } as Partial<OsirisWorkspaceState>);
}

/**
 * Mark workspace as running with progress info.
 */
export async function markRunning(
  workspaceName: string,
  currentStep: string,
  stepIndex: number = 0,
  totalSteps: number = 1,
): Promise<Result<void>> {
  return manager.markRunning(workspaceName, currentStep, stepIndex, totalSteps);
}

/**
 * Mark workspace as completed.
 */
export async function markCompleted(
  workspaceName: string,
  message?: string,
): Promise<Result<void>> {
  return manager.markCompleted(workspaceName, message);
}

/**
 * Mark workspace as failed.
 */
export async function markFailed(
  workspaceName: string,
  error: unknown,
): Promise<Result<void>> {
  return manager.markFailed(workspaceName, error as Parameters<typeof manager.markFailed>[1]);
}

/**
 * Delete a workspace.
 */
export async function deleteWorkspace(
  workspaceName: string,
): Promise<Result<boolean>> {
  return manager.deleteWorkspace(workspaceName);
}

/**
 * Append a log entry to a workspace.
 */
export async function appendLog(
  workspaceName: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: string,
  data?: Record<string, unknown>,
): Promise<void> {
  return manager.appendLog(workspaceName, level, message, context, data);
}

/**
 * Get OSIRIS tool status summary.
 */
export async function getStatus() {
  return manager.getStatus();
}

/**
 * Get the workspace name (directory) from a workspace ID.
 */
export async function resolveWorkspaceName(
  workspaceId: string,
): Promise<Result<string>> {
  const listResult = await listWorkspaces();
  if (isErr(listResult)) return err(listResult.error);

  const ws = listResult.value.find(w => w.id === workspaceId);
  if (!ws) {
    return err(createToolError(
      `Workspace with ID '${workspaceId}' not found`,
      'filesystem',
      { retryable: false },
    ));
  }

  // The workspace name is the directory name, which we can extract from the state
  // Since BaseTool doesn't store the dir name in state, we need to list and match
  // For now, use the ID-based directory convention
  // The workspace name is stored in the metadata or we can derive it
  // Actually, we need to scan directories. Let's use a different approach.
  return ok(ws.name);
}

/**
 * Find workspace directory name by workspace ID.
 * Since workspace.id is stored inside workspace.json, we need to scan.
 */
export async function findWorkspaceDirById(
  workspaceId: string,
): Promise<Result<string>> {
  const { promises: fs } = await import('fs');
  const path = await import('path');

  const rootDir = path.join('/home/z/my-project/workspaces', 'osiris');

  try {
    await fs.mkdir(rootDir, { recursive: true });
    const entries = await fs.readdir(rootDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const statePath = path.join(rootDir, entry.name, 'workspace.json');
          const data = await fs.readFile(statePath, 'utf-8');
          const state = JSON.parse(data);
          if (state.id === workspaceId) {
            return ok(entry.name);
          }
        } catch {
          // Skip malformed workspaces
        }
      }
    }

    return err(createToolError(
      `Workspace with ID '${workspaceId}' not found`,
      'filesystem',
      { retryable: false },
    ));
  } catch (error) {
    return err(createToolError(
      `Failed to scan workspaces: ${error instanceof Error ? error.message : String(error)}`,
      'filesystem',
      { retryable: true, cause: error },
    ));
  }
}

/**
 * Full workspace update: recon results + analysis + scoring in one batch.
 */
export async function fullWorkspaceUpdate(
  workspaceName: string,
  data: {
    reconResults?: ReconResult[];
    threatScore?: CompositeThreatScore;
    aiAnalysis?: AIAnalysis;
    entities?: IntelEntity[];
    threatIntel?: ThreatIntel[];
    status?: 'running' | 'completed' | 'failed';
    progress?: { step: string; index: number; total: number };
  },
): Promise<Result<OsirisWorkspaceState | null>> {
  const updates: Partial<OsirisWorkspaceState> = {};

  if (data.reconResults) updates.reconResults = data.reconResults;
  if (data.threatScore) updates.threatScore = data.threatScore;
  if (data.aiAnalysis) updates.aiAnalysis = data.aiAnalysis;
  if (data.entities) updates.entities = data.entities;
  if (data.threatIntel) updates.threatIntel = data.threatIntel;
  if (data.status) updates.status = data.status;
  if (data.progress) {
    updates.progress = createProgress(
      data.progress.step,
      data.progress.index,
      data.progress.total,
    );
  }

  return manager.updateState(workspaceName, updates);
}

/**
 * Add token usage to a workspace.
 */
export async function addTokenUsage(
  workspaceName: string,
  usage: { inputTokens: number; outputTokens: number; estimatedCostUsd: number; apiCalls: number },
): Promise<Result<void>> {
  return manager.addTokenUsage(workspaceName, usage);
}
