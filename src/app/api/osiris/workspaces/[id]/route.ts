/**
 * OSIRIS Workspace Detail API Route
 * GET /api/osiris/workspaces/[id]
 *
 * Get full workspace detail including all recon results,
 * threat scores, AI analysis, entities, and threat intel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findWorkspaceDirById, getWorkspace } from '@/lib/osiris/workspace-manager';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace ID is required', success: false },
        { status: 400 },
      );
    }

    // Find the workspace directory name by ID
    const dirResult = await findWorkspaceDirById(id);

    if (!dirResult.ok) {
      return NextResponse.json(
        {
          error: 'Workspace not found',
          details: dirResult.error.message,
          success: false,
        },
        { status: 404 },
      );
    }

    // Read the full workspace state
    const stateResult = await getWorkspace(dirResult.value);

    if (!stateResult.ok) {
      return NextResponse.json(
        {
          error: 'Failed to read workspace',
          details: stateResult.error.message,
          success: false,
        },
        { status: 500 },
      );
    }

    if (!stateResult.value) {
      return NextResponse.json(
        { error: 'Workspace not found', success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: stateResult.value,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get workspace',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
