/**
 * Cosmic Toolkit - Base Tool Class
 *
 * Abstract base class providing shared infrastructure for all tool backends.
 * Every tool (Shannon, Dexter, PPT Master, etc.) extends this class.
 *
 * Features:
 * - Common workspace directory management (under /home/z/my-project/workspaces/{tool-id}/)
 * - JSON state persistence with atomic writes
 * - Progress tracking with step-based model
 * - Log writing in JSONL format
 * - Token usage accumulation per workspace
 * - Error handling patterns with structured ToolError
 * - File deliverable management
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  type BaseWorkspaceState,
  type ToolStatus,
  type ToolError,
  type LogEntry,
  type LogLevel,
  type TokenUsage,
  type Result,
  ok,
  err,
  isErr,
  isTerminalStatus,
  createToolError,
  createProgress,
  createTokenUsage,
  mergeTokenUsage,
} from './types';

// =================== Constants ===================

const WORKSPACES_ROOT = path.join('/home/z/my-project/workspaces');

// =================== Abstract Base Tool ===================

export abstract class BaseTool<TState extends BaseWorkspaceState = BaseWorkspaceState> {
  /** Tool identifier (e.g., 'shannon', 'dexter', 'ppt-master') */
  abstract readonly toolId: string;

  /** Human-readable tool name */
  abstract readonly toolName: string;

  /** Root directory for this tool's workspaces */
  get workspacesRoot(): string {
    return path.join(WORKSPACES_ROOT, this.toolId);
  }

  // =================== Workspace Directory Management ===================

  /** Get the path to a specific workspace directory */
  protected workspaceDir(workspaceName: string): string {
    return path.join(this.workspacesRoot, workspaceName);
  }

  /** Get the path to a workspace's state JSON file */
  protected statePath(workspaceName: string): string {
    return path.join(this.workspaceDir(workspaceName), 'workspace.json');
  }

  /** Get the path to a workspace's JSONL log file */
  protected logsPath(workspaceName: string): string {
    return path.join(this.workspaceDir(workspaceName), 'logs.jsonl');
  }

  /** Get the path to a workspace's deliverables directory */
  protected deliverablesDir(workspaceName: string): string {
    return path.join(this.workspaceDir(workspaceName), 'deliverables');
  }

  /** Ensure a directory exists */
  protected async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  /** Check if a workspace directory exists */
  protected async workspaceExists(workspaceName: string): Promise<boolean> {
    try {
      const stat = await fs.stat(this.workspaceDir(workspaceName));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  // =================== State Persistence ===================

  /**
   * Initialize a new workspace with the given state.
   * Creates the directory structure and writes the initial state.
   */
  async initWorkspace(
    workspaceName: string,
    initialState: Partial<TState> & { name: string },
  ): Promise<Result<TState>> {
    try {
      const wsDir = this.workspaceDir(workspaceName);
      await this.ensureDir(wsDir);
      await this.ensureDir(this.deliverablesDir(workspaceName));

      const now = new Date().toISOString();
      const state = {
        id: `ws-${this.toolId}-${crypto.randomUUID().slice(0, 8)}`,
        name: initialState.name,
        toolId: this.toolId,
        status: 'initializing' as ToolStatus,
        createdAt: now,
        updatedAt: now,
        progress: createProgress('Initializing', 0, 1),
        tokenUsage: createTokenUsage(),
        ...initialState,
      } as TState;

      await this.writeState(workspaceName, state);
      await this.appendLog(workspaceName, 'info', `Workspace initialized: ${workspaceName}`);

      return ok(state);
    } catch (error) {
      return err(createToolError(
        `Failed to initialize workspace '${workspaceName}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: false, cause: error },
      ));
    }
  }

  /**
   * Read the current state of a workspace.
   * Returns null if the workspace doesn't exist.
   */
  async readState(workspaceName: string): Promise<Result<TState | null>> {
    try {
      const data = await fs.readFile(this.statePath(workspaceName), 'utf-8');
      return ok(JSON.parse(data) as TState);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return ok(null);
      }
      return err(createToolError(
        `Failed to read workspace state '${workspaceName}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Write (overwrite) the workspace state.
   * Uses atomic write: write to temp file then rename.
   */
  async writeState(workspaceName: string, state: TState): Promise<Result<void>> {
    try {
      const targetPath = this.statePath(workspaceName);
      const tempPath = `${targetPath}.tmp.${Date.now()}`;

      // Ensure directory exists
      await this.ensureDir(this.workspaceDir(workspaceName));

      // Write to temp file first
      const data = JSON.stringify(state, null, 2);
      await fs.writeFile(tempPath, data, 'utf-8');

      // Atomic rename
      await fs.rename(tempPath, targetPath);

      return ok(undefined);
    } catch (error) {
      return err(createToolError(
        `Failed to write workspace state '${workspaceName}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Update specific fields of the workspace state (partial update).
   * Automatically updates the `updatedAt` timestamp.
   */
  async updateState(
    workspaceName: string,
    updates: Partial<TState>,
  ): Promise<Result<TState | null>> {
    const stateResult = await this.readState(workspaceName);
    if (isErr(stateResult)) return err(stateResult.error);

    const current = stateResult.value;
    if (!current) return ok(null);

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as TState;

    const writeResult = await this.writeState(workspaceName, updated);
    if (isErr(writeResult)) return err(writeResult.error);

    return ok(updated);
  }

  // =================== Progress Tracking ===================

  /**
   * Update workspace progress.
   * Convenience method that merges progress into the state.
   */
  async updateProgress(
    workspaceName: string,
    currentStep: string,
    stepIndex: number,
    totalSteps: number,
    message?: string,
  ): Promise<Result<void>> {
    const progress = createProgress(currentStep, stepIndex, totalSteps, message);
    const result = await this.updateState(workspaceName, { progress } as Partial<TState>);
    if (isErr(result)) return err(result.error);
    return ok(undefined);
  }

  /**
   * Mark the workspace status as running with an initial step.
   */
  async markRunning(
    workspaceName: string,
    currentStep: string,
    stepIndex: number = 0,
    totalSteps: number = 1,
  ): Promise<Result<void>> {
    const progress = createProgress(currentStep, stepIndex, totalSteps);
    const result = await this.updateState(workspaceName, {
      status: 'running',
      progress,
    } as Partial<TState>);
    if (isErr(result)) return err(result.error);

    await this.appendLog(workspaceName, 'info', `Started: ${currentStep}`);
    return ok(undefined);
  }

  /**
   * Mark the workspace as completed.
   */
  async markCompleted(
    workspaceName: string,
    message?: string,
  ): Promise<Result<void>> {
    const now = new Date().toISOString();
    const progress = createProgress('Completed', 1, 1, message);
    const result = await this.updateState(workspaceName, {
      status: 'completed',
      completedAt: now,
      progress,
    } as Partial<TState>);
    if (isErr(result)) return err(result.error);

    await this.appendLog(workspaceName, 'info', message || 'Workspace completed successfully');
    return ok(undefined);
  }

  /**
   * Mark the workspace as failed with an error.
   */
  async markFailed(
    workspaceName: string,
    error: ToolError | Error | string,
  ): Promise<Result<void>> {
    const toolError: ToolError = error instanceof Error
      ? createToolError(error.message, 'unknown', { cause: error })
      : typeof error === 'string'
        ? createToolError(error, 'unknown')
        : error;

    const now = new Date().toISOString();
    const result = await this.updateState(workspaceName, {
      status: 'failed',
      completedAt: now,
      error: toolError,
    } as Partial<TState>);
    if (isErr(result)) return err(result.error);

    await this.appendLog(workspaceName, 'error', `Failed: ${toolError.message}`);
    return ok(undefined);
  }

  /**
   * Mark the workspace as cancelled.
   */
  async markCancelled(workspaceName: string): Promise<Result<void>> {
    const now = new Date().toISOString();
    const result = await this.updateState(workspaceName, {
      status: 'cancelled',
      completedAt: now,
    } as Partial<TState>);
    if (isErr(result)) return err(result.error);

    await this.appendLog(workspaceName, 'info', 'Workspace cancelled by user');
    return ok(undefined);
  }

  // =================== Log Writing (JSONL) ===================

  /**
   * Append a structured log entry to the workspace's JSONL log file.
   * This method never throws — log failures are silently ignored to avoid
   * disrupting the main workflow.
   */
  async appendLog(
    workspaceName: string,
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(data ? { data } : {}),
    };

    try {
      await fs.appendFile(
        this.logsPath(workspaceName),
        JSON.stringify(entry) + '\n',
        'utf-8',
      );
    } catch {
      // Silent failure — logging must never break the main workflow
    }
  }

  /**
   * Read log entries from a workspace.
   * Returns entries in chronological order (oldest first).
   */
  async readLogs(
    workspaceName: string,
    options?: {
      limit?: number;
      level?: LogLevel;
      since?: string; // ISO timestamp
    },
  ): Promise<Result<LogEntry[]>> {
    try {
      const data = await fs.readFile(this.logsPath(workspaceName), 'utf-8');
      let entries = data
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return {
              timestamp: new Date().toISOString(),
              level: 'info' as const,
              message: line,
            };
          }
        });

      // Filter by level
      if (options?.level) {
        entries = entries.filter(e => e.level === options.level);
      }

      // Filter by timestamp
      if (options?.since) {
        const sinceTime = new Date(options.since).getTime();
        entries = entries.filter(e => new Date(e.timestamp).getTime() >= sinceTime);
      }

      // Apply limit (take from the end — most recent)
      if (options?.limit && entries.length > options.limit) {
        entries = entries.slice(-options.limit);
      }

      return ok(entries);
    } catch {
      if ((await fs.stat(this.logsPath(workspaceName)).catch(() => null)) === null) {
        return ok([]);
      }
      return err(createToolError(
        `Failed to read logs for workspace '${workspaceName}'`,
        'filesystem',
        { retryable: true },
      ));
    }
  }

  // =================== Token Usage Tracking ===================

  /**
   * Add token usage to the workspace's accumulated totals.
   */
  async addTokenUsage(
    workspaceName: string,
    usage: TokenUsage,
  ): Promise<Result<void>> {
    const stateResult = await this.readState(workspaceName);
    if (isErr(stateResult)) return err(stateResult.error);

    const current = stateResult.value;
    if (!current) {
      return err(createToolError(
        `Workspace '${workspaceName}' not found`,
        'filesystem',
        { retryable: false },
      ));
    }

    const existing = current.tokenUsage || createTokenUsage();
    const merged = mergeTokenUsage(existing, usage);

    const updateResult = await this.updateState(workspaceName, {
      tokenUsage: merged,
    } as Partial<TState>);
    if (isErr(updateResult)) return err(updateResult.error);

    return ok(undefined);
  }

  /**
   * Get the accumulated token usage for a workspace.
   */
  async getTokenUsage(workspaceName: string): Promise<Result<TokenUsage>> {
    const stateResult = await this.readState(workspaceName);
    if (isErr(stateResult)) return err(stateResult.error);

    const current = stateResult.value;
    if (!current) {
      return err(createToolError(
        `Workspace '${workspaceName}' not found`,
        'filesystem',
        { retryable: false },
      ));
    }

    return ok(current.tokenUsage || createTokenUsage());
  }

  // =================== Deliverable Management ===================

  /**
   * Save a deliverable file to the workspace.
   */
  async saveDeliverable(
    workspaceName: string,
    filename: string,
    content: string | Buffer,
  ): Promise<Result<string>> {
    try {
      const dir = this.deliverablesDir(workspaceName);
      await this.ensureDir(dir);
      const filePath = path.join(dir, filename);
      await fs.writeFile(filePath, content);
      await this.appendLog(workspaceName, 'info', `Deliverable saved: ${filename}`);
      return ok(filePath);
    } catch (error) {
      return err(createToolError(
        `Failed to save deliverable '${filename}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Read a deliverable file from the workspace.
   */
  async readDeliverable(
    workspaceName: string,
    filename: string,
  ): Promise<Result<string | null>> {
    try {
      const filePath = path.join(this.deliverablesDir(workspaceName), filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return ok(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return ok(null);
      }
      return err(createToolError(
        `Failed to read deliverable '${filename}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * List all deliverable files in the workspace.
   */
  async listDeliverables(workspaceName: string): Promise<Result<string[]>> {
    try {
      const dir = this.deliverablesDir(workspaceName);
      await this.ensureDir(dir);
      const files = await fs.readdir(dir);
      return ok(files.sort());
    } catch (error) {
      return err(createToolError(
        `Failed to list deliverables: ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Delete a specific deliverable file.
   */
  async deleteDeliverable(
    workspaceName: string,
    filename: string,
  ): Promise<Result<boolean>> {
    try {
      const filePath = path.join(this.deliverablesDir(workspaceName), filename);
      await fs.unlink(filePath);
      await this.appendLog(workspaceName, 'info', `Deliverable deleted: ${filename}`);
      return ok(true);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return ok(false);
      }
      return err(createToolError(
        `Failed to delete deliverable '${filename}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  // =================== Workspace CRUD ===================

  /**
   * List all workspaces for this tool, sorted by creation date (newest first).
   */
  async listWorkspaces(): Promise<Result<TState[]>> {
    try {
      await this.ensureDir(this.workspacesRoot);

      const entries = await fs.readdir(this.workspacesRoot, { withFileTypes: true });
      const workspaces: TState[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const stateResult = await this.readState(entry.name);
          if (stateResult.ok && stateResult.value) {
            workspaces.push(stateResult.value);
          }
        }
      }

      workspaces.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return ok(workspaces);
    } catch (error) {
      return err(createToolError(
        `Failed to list workspaces: ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Delete a workspace and all its files.
   */
  async deleteWorkspace(workspaceName: string): Promise<Result<boolean>> {
    try {
      const wsDir = this.workspaceDir(workspaceName);
      await fs.rm(wsDir, { recursive: true, force: true });
      return ok(true);
    } catch (error) {
      return err(createToolError(
        `Failed to delete workspace '${workspaceName}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: false, cause: error },
      ));
    }
  }

  /**
   * Check if a workspace exists.
   */
  async workspaceExistsCheck(workspaceName: string): Promise<boolean> {
    return this.workspaceExists(workspaceName);
  }

  /**
   * Get a workspace's state or throw.
   * Convenience method for use in API routes where 404 is expected.
   */
  async getWorkspaceOrThrow(workspaceName: string): Promise<TState> {
    const result = await this.readState(workspaceName);
    if (isErr(result)) throw new Error(result.error.message);
    if (!result.value) throw new Error(`Workspace '${workspaceName}' not found`);
    return result.value;
  }

  // =================== Status Helpers ===================

  /**
   * Get a summary of the tool's status across all workspaces.
   */
  async getStatus(): Promise<{
    totalWorkspaces: number;
    activeWorkspaces: number;
    completedWorkspaces: number;
    failedWorkspaces: number;
    totalTokenUsage: TokenUsage;
  }> {
    const listResult = await this.listWorkspaces();
    const workspaces = listResult.ok ? listResult.value : [];

    const active = workspaces.filter(w => !isTerminalStatus(w.status));
    const completed = workspaces.filter(w => w.status === 'completed');
    const failed = workspaces.filter(w => w.status === 'failed');

    const totalUsage = workspaces.reduce<TokenUsage>(
      (acc, ws) => mergeTokenUsage(acc, ws.tokenUsage || createTokenUsage()),
      createTokenUsage(),
    );

    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaces: active.length,
      completedWorkspaces: completed.length,
      failedWorkspaces: failed.length,
      totalTokenUsage: totalUsage,
    };
  }

  // =================== Protected Utilities ===================

  /**
   * Generate a unique workspace name.
   * Format: {prefix}-{timestamp}-{random}
   */
  protected generateWorkspaceName(prefix?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const random = crypto.randomUUID().slice(0, 6);
    return `${prefix || this.toolId}-${timestamp}-${random}`;
  }

  /**
   * Write arbitrary data to a file in the workspace directory.
   * (Not in deliverables — for internal tool files like configs, temp data, etc.)
   */
  protected async writeWorkspaceFile(
    workspaceName: string,
    filename: string,
    content: string | Buffer,
  ): Promise<Result<string>> {
    try {
      const dir = this.workspaceDir(workspaceName);
      await this.ensureDir(dir);
      const filePath = path.join(dir, filename);
      await fs.writeFile(filePath, content);
      return ok(filePath);
    } catch (error) {
      return err(createToolError(
        `Failed to write workspace file '${filename}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }

  /**
   * Read an arbitrary file from the workspace directory.
   */
  protected async readWorkspaceFile(
    workspaceName: string,
    filename: string,
  ): Promise<Result<string | null>> {
    try {
      const filePath = path.join(this.workspaceDir(workspaceName), filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return ok(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return ok(null);
      }
      return err(createToolError(
        `Failed to read workspace file '${filename}': ${error instanceof Error ? error.message : String(error)}`,
        'filesystem',
        { retryable: true, cause: error },
      ));
    }
  }
}
