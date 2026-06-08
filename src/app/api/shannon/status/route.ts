/**
 * Shannon - Status API Route
 * Returns system status and health information
 */

import { NextResponse } from 'next/server';
import { listWorkspaces } from '@/lib/shannon';

export async function GET() {
  try {
    const workspaces = await listWorkspaces();
    const runningWorkspaces = workspaces.filter(ws => ws.status === 'running');

    return NextResponse.json({
      temporal: {
        status: 'healthy',
        address: 'in-process',
        version: '1.5.0-web',
        uptime: process.uptime ? `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m` : 'unknown',
      },
      pipeline: {
        status: 'running',
        activeScans: runningWorkspaces.length,
        mode: 'in-process',
      },
      workspaces: {
        total: workspaces.length,
        running: runningWorkspaces.length,
        completed: workspaces.filter(ws => ws.status === 'completed').length,
        failed: workspaces.filter(ws => ws.status === 'failed').length,
      },
      credentials: {
        provider: process.env.SHANNON_MEDIUM_MODEL ? 'custom' : 'z-ai-web-dev-sdk',
        configured: true,
        model: process.env.SHANNON_MEDIUM_MODEL || 'glm-4-plus',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
