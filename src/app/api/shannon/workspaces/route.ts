/**
 * Shannon - Workspaces API Route
 * Lists all workspaces with their current state
 */

import { NextResponse } from 'next/server';
import { listWorkspaces } from '@/lib/shannon';

export async function GET() {
  try {
    const workspaces = await listWorkspaces();

    return NextResponse.json({
      workspaces: workspaces.map(ws => ({
        id: ws.id,
        name: ws.name,
        target: ws.targetUrl,
        repo: ws.repoPath,
        status: ws.status,
        createdAt: ws.createdAt,
        completedAt: ws.completedAt,
        duration: ws.completedAt
          ? `${((new Date(ws.completedAt).getTime() - new Date(ws.createdAt).getTime()) / 60000).toFixed(1)}m`
          : undefined,
        findings: ws.findings,
        cost: ws.cost ? `$${ws.cost.toFixed(4)}` : undefined,
        agents: {
          completed: Object.values(ws.agentMetrics).filter(m => m.durationMs > 0).length,
          total: ws.pipeline.reduce((sum, phase) => sum + phase.agents.length, 0),
        },
        currentPhase: ws.currentPhase,
        currentAgent: ws.currentAgent,
        error: ws.error,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list workspaces', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
