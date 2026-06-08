/**
 * Shannon - Stop Scan API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { stopPipeline } from '@/lib/shannon';

export async function POST(req: NextRequest) {
  try {
    const { scanId, workspace } = await req.json();
    const workspaceName = workspace || scanId;

    if (!workspaceName) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    await stopPipeline(workspaceName);

    return NextResponse.json({
      success: true,
      message: 'Pipeline stopped',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop scan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
