/**
 * Shannon - Workspace Manager
 * Manages scan workspaces using file system storage
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  type WorkspaceState,
  type LogEntry,
  type Config,
  type AgentMetrics,
  type AgentProgress,
  type PipelinePhase,
  type AgentName,
  ALL_AGENTS,
  AGENT_DEFINITIONS,
} from './types';

const WORKSPACES_DIR = path.join(process.cwd(), 'workspaces', 'shannon');

/** Ensure the workspaces directory exists */
async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Get workspace directory path */
function workspaceDir(name: string): string {
  return path.join(WORKSPACES_DIR, name);
}

/** Get workspace metadata file path */
function workspaceMetaPath(name: string): string {
  return path.join(workspaceDir(name), 'workspace.json');
}

/** Get workspace logs file path */
function workspaceLogsPath(name: string): string {
  return path.join(workspaceDir(name), 'logs.jsonl');
}

/** Get workspace deliverables directory */
export function workspaceDeliverablesDir(name: string): string {
  return path.join(workspaceDir(name), 'deliverables');
}

/** Create a new workspace */
export async function createWorkspace(
  name: string,
  targetUrl: string,
  repoPath: string,
  config: Config,
): Promise<WorkspaceState> {
  await ensureDir(workspaceDir(name));
  await ensureDir(workspaceDeliverablesDir(name));

  const workspace: WorkspaceState = {
    id: `ws-${crypto.randomUUID().slice(0, 8)}`,
    name,
    targetUrl,
    repoPath,
    config,
    status: 'initializing',
    createdAt: new Date().toISOString(),
    agentMetrics: {},
    pipeline: buildInitialPipeline(config),
  };

  await fs.writeFile(workspaceMetaPath(name), JSON.stringify(workspace, null, 2));
  await fs.writeFile(workspaceLogsPath(name), '');

  return workspace;
}

/** Build initial pipeline structure from config */
function buildInitialPipeline(config: Config): PipelinePhase[] {
  const vulnClasses = config.vuln_classes || ['injection', 'xss', 'auth', 'authz', 'ssrf'];
  const exploitEnabled = config.exploit !== 'false';

  const phases: PipelinePhase[] = [
    { phase: 'preflight', status: 'pending', agents: [] },
    { phase: 'pre-recon', status: 'pending', agents: [makeAgentProgress('pre-recon')] },
    { phase: 'recon', status: 'pending', agents: [makeAgentProgress('recon')] },
    {
      phase: 'vuln-analysis',
      status: 'pending',
      agents: vulnClasses.map(cls => makeAgentProgress(`${cls}-vuln` as AgentName)).filter(a => ALL_AGENTS.includes(a.name)),
    },
  ];

  if (exploitEnabled) {
    phases.push({
      phase: 'exploitation',
      status: 'pending',
      agents: vulnClasses.map(cls => makeAgentProgress(`${cls}-exploit` as AgentName)).filter(a => ALL_AGENTS.includes(a.name)),
    });
  }

  phases.push({ phase: 'reporting', status: 'pending', agents: [makeAgentProgress('report')] });

  return phases;
}

function makeAgentProgress(name: AgentName): AgentProgress {
  const def = AGENT_DEFINITIONS.find(d => d.name === name);
  return {
    name,
    status: 'pending',
    progress: 0,
    model: def?.modelTier || 'medium',
  };
}

/** Get a workspace by name */
export async function getWorkspace(name: string): Promise<WorkspaceState | null> {
  try {
    const data = await fs.readFile(workspaceMetaPath(name), 'utf-8');
    return JSON.parse(data) as WorkspaceState;
  } catch {
    return null;
  }
}

/** List all workspaces */
export async function listWorkspaces(): Promise<WorkspaceState[]> {
  await ensureDir(WORKSPACES_DIR);

  try {
    const entries = await fs.readdir(WORKSPACES_DIR, { withFileTypes: true });
    const workspaces: WorkspaceState[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const ws = await getWorkspace(entry.name);
        if (ws) workspaces.push(ws);
      }
    }

    return workspaces.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/** Update workspace state */
export async function updateWorkspace(
  name: string,
  updates: Partial<WorkspaceState>,
): Promise<WorkspaceState | null> {
  const workspace = await getWorkspace(name);
  if (!workspace) return null;

  const updated = { ...workspace, ...updates };
  await fs.writeFile(workspaceMetaPath(name), JSON.stringify(updated, null, 2));
  return updated;
}

/** Update a specific agent's progress in the pipeline */
export async function updateAgentProgress(
  workspaceName: string,
  agentName: AgentName,
  updates: Partial<AgentProgress>,
): Promise<void> {
  const workspace = await getWorkspace(workspaceName);
  if (!workspace) return;

  const pipeline = [...workspace.pipeline];
  for (const phase of pipeline) {
    const agent = phase.agents.find(a => a.name === agentName);
    if (agent) {
      Object.assign(agent, updates);
      break;
    }
  }

  await updateWorkspace(workspaceName, { pipeline });
}

/** Update a phase status */
export async function updatePhaseStatus(
  workspaceName: string,
  phaseName: string,
  status: PipelinePhase['status'],
): Promise<void> {
  const workspace = await getWorkspace(workspaceName);
  if (!workspace) return;

  const pipeline = [...workspace.pipeline];
  const phase = pipeline.find(p => p.phase === phaseName);
  if (phase) {
    phase.status = status;
    await updateWorkspace(workspaceName, { pipeline });
  }
}

/** Add agent metrics */
export async function addAgentMetrics(
  workspaceName: string,
  agentName: string,
  metrics: AgentMetrics,
): Promise<void> {
  const workspace = await getWorkspace(workspaceName);
  if (!workspace) return;

  const agentMetrics = { ...workspace.agentMetrics, [agentName]: metrics };
  await updateWorkspace(workspaceName, { agentMetrics });
}

/** Delete a workspace */
export async function deleteWorkspace(name: string): Promise<boolean> {
  try {
    await fs.rm(workspaceDir(name), { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

/** Add a log entry */
export async function addLog(
  workspaceName: string,
  level: LogEntry['level'],
  message: string,
  context?: string,
): Promise<void> {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  try {
    await fs.appendFile(
      workspaceLogsPath(workspaceName),
      JSON.stringify(entry) + '\n',
    );
  } catch {
    // If we can't write logs, don't fail the operation
  }
}

/** Get logs for a workspace */
export async function getLogs(workspaceName: string, limit = 500): Promise<LogEntry[]> {
  try {
    const data = await fs.readFile(workspaceLogsPath(workspaceName), 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map(line => {
      try { return JSON.parse(line) as LogEntry; }
      catch { return { timestamp: new Date().toISOString(), level: 'info' as const, message: line }; }
    });
  } catch {
    return [];
  }
}

/** Save a deliverable to the workspace */
export async function saveDeliverable(
  workspaceName: string,
  filename: string,
  content: string,
): Promise<void> {
  const dir = workspaceDeliverablesDir(workspaceName);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, filename), content);
}

/** Read a deliverable from the workspace */
export async function readDeliverable(
  workspaceName: string,
  filename: string,
): Promise<string | null> {
  try {
    return await fs.readFile(path.join(workspaceDeliverablesDir(workspaceName), filename), 'utf-8');
  } catch {
    return null;
  }
}

/** List deliverables in the workspace */
export async function listDeliverables(workspaceName: string): Promise<string[]> {
  try {
    const dir = workspaceDeliverablesDir(workspaceName);
    await ensureDir(dir);
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}
