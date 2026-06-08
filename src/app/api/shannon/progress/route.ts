/**
 * Shannon - Progress API Route
 * Returns pipeline progress for a specific scan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkspace, isPipelineRunning } from '@/lib/shannon';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get('scanId');
    const workspace = searchParams.get('workspace');
    const workspaceName = workspace || scanId;

    if (!workspaceName) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const ws = await getWorkspace(workspaceName);
    if (!ws) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      pipeline: ws.pipeline,
      status: ws.status,
      currentPhase: ws.currentPhase,
      currentAgent: ws.currentAgent,
      isRunning: isPipelineRunning(workspaceName),
      agentMetrics: ws.agentMetrics,
      findings: ws.findings,
      cost: ws.cost,
      error: ws.error,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
