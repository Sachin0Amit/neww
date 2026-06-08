/**
 * Shannon - Logs API Route
 * Returns logs for a specific workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLogs, getWorkspace } from '@/lib/shannon';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspace = searchParams.get('workspace');
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const ws = await getWorkspace(workspace);
    if (!ws) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const logs = await getLogs(workspace, limit);

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
