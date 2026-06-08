/**
 * PPT Master - Workspace Manager
 * Extends BaseTool for PPT Master workspace persistence and CRUD operations.
 * Stores presentations, generation progress, and intermediate pipeline results.
 */

import { BaseTool } from '@/lib/base-tool'
import { type Result, ok, err, isErr, createTokenUsage } from '@/lib/types'
import type {
  PPTWorkspaceState,
  GenerationConfig,
  Presentation,
  PipelineStep,
  PipelineContext,
} from './types'
import { getDesignSpec, getTemplatePreset } from './template-system'

// =================== Workspace Manager ===================

class PPTWorkspaceManager extends BaseTool<PPTWorkspaceState> {
  readonly toolId = 'ppt-master'
  readonly toolName = 'PPT Master'

  /** Create a new workspace for a generation request */
  async createWorkspace(config: GenerationConfig): Promise<Result<{ state: PPTWorkspaceState; directoryName: string }>> {
    const workspaceName = this.generateWorkspaceName('ppt')

    const templateId = config.templateId
    const template = templateId ? getTemplatePreset(templateId) : undefined
    const designSpec = template ? template.design : getDesignSpec(config.style)

    const pipelineSteps: PipelineStep[] = [
      { name: 'Topic Analysis', status: 'pending' },
      { name: 'Outline Generation', status: 'pending' },
      { name: 'Content Generation', status: 'pending' },
      { name: 'Visual Planning', status: 'pending' },
      { name: 'Layout Design', status: 'pending' },
      { name: 'Image Integration', status: 'pending' },
      { name: 'Assembly & Export', status: 'pending' },
    ]

    const state = await this.initWorkspace(workspaceName, {
      name: `PPT: ${config.topic}`,
      config: {
        ...config,
        style: designSpec.style,
      },
      pipelineSteps,
      tokenUsage: createTokenUsage(),
      metadata: { directoryName: workspaceName },
    })

    if (isErr(state)) return err(state.error)

    return ok({ state: state.value, directoryName: workspaceName })
  }

  /** Get workspace state */
  async getWorkspace(workspaceName: string): Promise<Result<PPTWorkspaceState | null>> {
    return this.readState(workspaceName)
  }

  /** List all PPT Master workspaces */
  async listAllWorkspaces(): Promise<Result<PPTWorkspaceState[]>> {
    return this.listWorkspaces()
  }

  /** Delete a workspace */
  async removeWorkspace(workspaceName: string): Promise<Result<boolean>> {
    return this.deleteWorkspace(workspaceName)
  }

  /** Update pipeline step status */
  async updatePipelineStep(
    workspaceName: string,
    stepIndex: number,
    status: PipelineStep['status'],
    durationMs?: number,
    error?: string,
  ): Promise<Result<void>> {
    const stateResult = await this.readState(workspaceName)
    if (isErr(stateResult)) return err(stateResult.error)
    const current = stateResult.value
    if (!current) return err(createWorkspaceNotFoundError(workspaceName))

    const steps = [...(current.pipelineSteps || [])]
    if (steps[stepIndex]) {
      steps[stepIndex] = {
        ...steps[stepIndex],
        status,
        ...(durationMs !== undefined ? { durationMs } : {}),
        ...(error !== undefined ? { error } : {}),
      }
    }

    // Calculate progress
    const completedSteps = steps.filter(s => s.status === 'completed').length
    const totalSteps = steps.length
    const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    const currentStep = steps.find(s => s.status === 'running')?.name || 
                        steps[completedSteps]?.name || 'Unknown'

    const updateResult = await this.updateState(workspaceName, {
      pipelineSteps: steps,
      progress: {
        currentStep,
        stepIndex: completedSteps,
        totalSteps,
        percent,
        timestamp: new Date().toISOString(),
      },
    } as Partial<PPTWorkspaceState>)

    if (isErr(updateResult)) return err(updateResult.error)
    return ok(undefined)
  }

  /** Save presentation to workspace */
  async savePresentation(
    workspaceName: string,
    presentation: Presentation,
    outputFilePath?: string,
  ): Promise<Result<void>> {
    const updateResult = await this.updateState(workspaceName, {
      presentation,
      ...(outputFilePath ? { outputFilePath } : {}),
    } as Partial<PPTWorkspaceState>)

    if (isErr(updateResult)) return err(updateResult.error)

    // Also save the presentation JSON as a deliverable
    const jsonStr = JSON.stringify(presentation, null, 2)
    const saveResult = await this.saveDeliverable(
      workspaceName,
      'presentation.json',
      jsonStr,
    )
    if (isErr(saveResult)) return err(saveResult.error)

    return ok(undefined)
  }

  /** Save pipeline context intermediate results */
  async savePipelineContext(
    workspaceName: string,
    context: PipelineContext,
  ): Promise<Result<void>> {
    const jsonStr = JSON.stringify(context, null, 2)
    const result = await this.saveDeliverable(
      workspaceName,
      'pipeline-context.json',
      jsonStr,
    )
    if (isErr(result)) return err(result.error)
    return ok(undefined)
  }

  /** Read pipeline context from deliverables */
  async readPipelineContext(workspaceName: string): Promise<Result<PipelineContext | null>> {
    const content = await this.readDeliverable(workspaceName, 'pipeline-context.json')
    if (isErr(content)) return err(content.error)
    if (!content.value) return ok(null)
    try {
      return ok(JSON.parse(content.value) as PipelineContext)
    } catch {
      return err({ type: 'filesystem' as const, message: 'Failed to parse pipeline context', retryable: false, timestamp: new Date().toISOString() })
    }
  }

  /** Add token usage to workspace */
  async addUsage(
    workspaceName: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
  ): Promise<void> {
    await this.addTokenUsage(workspaceName, {
      inputTokens,
      outputTokens,
      estimatedCostUsd: cost,
      apiCalls: 1,
    })
  }

  /** Get workspace status summary */
  async getStatusSummary(): Promise<{
    totalWorkspaces: number
    activeWorkspaces: number
    completedWorkspaces: number
    failedWorkspaces: number
  }> {
    const status = await this.getStatus()
    return {
      totalWorkspaces: status.totalWorkspaces,
      activeWorkspaces: status.activeWorkspaces,
      completedWorkspaces: status.completedWorkspaces,
      failedWorkspaces: status.failedWorkspaces,
    }
  }
}

// =================== Helper ===================

function createWorkspaceNotFoundError(name: string) {
  return {
    type: 'filesystem' as const,
    message: `Workspace '${name}' not found`,
    retryable: false,
    timestamp: new Date().toISOString(),
  }
}

// =================== Singleton ===================

let _instance: PPTWorkspaceManager | null = null

/** Get the singleton PPT workspace manager */
export function getWorkspaceManager(): PPTWorkspaceManager {
  if (!_instance) {
    _instance = new PPTWorkspaceManager()
  }
  return _instance
}

/** Reset the singleton (for testing) */
export function resetWorkspaceManager(): void {
  _instance = null
}

export { PPTWorkspaceManager }
