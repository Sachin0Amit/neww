/**
 * Shannon - Deliverables API Route
 * Returns deliverables for a specific workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkspace, listDeliverables, readDeliverable, parseFindings } from '@/lib/shannon';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspace = searchParams.get('workspace');
    const file = searchParams.get('file');
    const findings = searchParams.get('findings') === 'true';

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const ws = await getWorkspace(workspace);
    if (!ws) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Return specific file content
    if (file) {
      const content = await readDeliverable(workspace, file);
      if (!content) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      return NextResponse.json({ file, content });
    }

    // Return parsed findings
    if (findings) {
      const parsedFindings = await parseFindings(workspace);
      return NextResponse.json({ findings: parsedFindings });
    }

    // Return list of deliverables
    const files = await listDeliverables(workspace);
    return NextResponse.json({
      deliverables: files,
      workspace: {
        name: ws.name,
        status: ws.status,
        findings: ws.findings,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get deliverables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
