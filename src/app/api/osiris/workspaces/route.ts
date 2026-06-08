/**
 * OSIRIS Workspaces API Route
 * GET  /api/osiris/workspaces - List all workspaces
 * POST /api/osiris/workspaces - Create a new workspace
 *
 * Workspaces persist recon results, threat scores, AI analyses,
 * entities, and threat intel per target.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listWorkspaces,
  createWorkspace,
} from '@/lib/osiris/workspace-manager';
import type { IntelDomain } from '@/lib/osiris/types';

export async function GET() {
  try {
    const result = await listWorkspaces();

    if (!result.ok) {
      return NextResponse.json(
        {
          error: 'Failed to list workspaces',
          details: result.error.message,
          success: false,
        },
        { status: 500 },
      );
    }

    const workspaces = result.value.map(ws => ({
      id: ws.id,
      name: ws.name,
      target: ws.target,
      domain: ws.domain,
      status: ws.status,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      reconResultsCount: ws.reconResults?.length ?? 0,
      threatLevel: ws.threatScore?.threat_level,
      overallScore: ws.threatScore?.overall_score,
      analysisDepth: ws.aiAnalysis?.analysis_depth,
      entitiesCount: ws.entities?.length ?? 0,
      threatIntelCount: ws.threatIntel?.length ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        workspaces,
        total: workspaces.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to list workspaces',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, domain } = body as {
      target?: string;
      domain?: string;
    };

    // Validate target
    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { error: 'Target is required to create a workspace', success: false },
        { status: 400 },
      );
    }

    const sanitizedTarget = target.trim();

    // Validate domain if provided
    const validDomains: IntelDomain[] = ['AIR', 'SEA', 'LAND', 'SPACE', 'CYBER'];
    const intelDomain = domain && validDomains.includes(domain as IntelDomain)
      ? (domain as IntelDomain)
      : undefined;

    const result = await createWorkspace(sanitizedTarget, intelDomain);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: 'Failed to create workspace',
          details: result.error.message,
          success: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        state: result.value.state,
        workspaceName: result.value.workspaceName,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create workspace',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
