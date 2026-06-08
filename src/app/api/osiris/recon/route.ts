/**
 * OSIRIS Recon API Route
 * POST /api/osiris/recon
 *
 * Executes real OSINT reconnaissance tools against a target.
 * Accepts { target, tools?, domain? } and uses runReconTools() for real data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RECON_TOOLS, runReconTools } from '@/lib/osiris/recon-tools';
import {
  createWorkspace,
  updateReconResults,
  markRunning,
  markCompleted,
  appendLog,
} from '@/lib/osiris/workspace-manager';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { target, tools, domain } = body as {
      target?: string;
      tools?: string[];
      domain?: string;
    };

    // Validate target
    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { error: 'Target (domain, IP, or identifier) is required', success: false },
        { status: 400 },
      );
    }

    const sanitizedTarget = target.trim();

    // Resolve tool IDs
    const allToolIds = RECON_TOOLS.map(t => t.id);
    const selectedToolIds = tools && Array.isArray(tools) && tools.length > 0
      ? tools.filter((id: string) => allToolIds.includes(id))
      : allToolIds;

    if (selectedToolIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid tools specified', availableTools: allToolIds, success: false },
        { status: 400 },
      );
    }

    // Create a workspace for this recon operation
    const workspaceResult = await createWorkspace(
      sanitizedTarget,
      domain as 'AIR' | 'SEA' | 'LAND' | 'SPACE' | 'CYBER' | undefined,
    );

    let workspaceName: string | null = null;
    let workspaceId: string | undefined;

    if (workspaceResult.ok) {
      workspaceName = workspaceResult.value.workspaceName;
      workspaceId = workspaceResult.value.state.id;

      await markRunning(workspaceName, `Running ${selectedToolIds.length} recon tools`, 0, selectedToolIds.length);
      await appendLog(workspaceName, 'info', `Starting reconnaissance on ${sanitizedTarget} with ${selectedToolIds.length} tools`);
    }

    // Execute real recon tools
    const results = await runReconTools(
      sanitizedTarget,
      selectedToolIds,
      (toolId, index, total) => {
        if (workspaceName) {
          markRunning(workspaceName, `Running ${toolId}`, index + 1, total).catch(() => {});
        }
      },
    );

    // Update workspace with results
    if (workspaceName) {
      await updateReconResults(workspaceName, results);
      await markCompleted(workspaceName, `Reconnaissance completed: ${results.length} tools executed`);
      await appendLog(workspaceName, 'info', `Reconnaissance complete: ${results.filter(r => !r.error).length}/${results.length} successful`);
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        target: sanitizedTarget,
        domain: domain || 'CYBER',
        results,
        summary: {
          totalTools: results.length,
          successful: results.filter(r => !r.error).length,
          failed: results.filter(r => r.error).length,
        },
        workspaceId,
      },
      meta: {
        durationMs,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Reconnaissance failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
