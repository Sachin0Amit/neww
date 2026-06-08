/**
 * Shannon - Start Scan API Route
 * Creates a workspace and starts the pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWorkspace, startPipeline, distributeConfig } from '@/lib/shannon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url, repo, workspace, pipelineTesting, exploit, vulnClasses,
      authentication, rules, report, description, rulesOfEngagement,
      maxConcurrent, retryPreset,
    } = body;

    if (!url || !repo) {
      return NextResponse.json(
        { error: 'Target URL and repository path are required' },
        { status: 400 },
      );
    }

    // Build the scan configuration
    const config = {
      ...(authentication ? { authentication } : {}),
      ...(rules ? { rules } : {}),
      ...(description ? { description } : {}),
      ...(vulnClasses ? { vuln_classes: vulnClasses } : {}),
      ...(exploit !== undefined ? { exploit: exploit ? 'true' : 'false' } : {}),
      ...(report ? { report } : {}),
      ...(rulesOfEngagement ? { rules_of_engagement: rulesOfEngagement } : {}),
      pipeline: {
        ...(retryPreset ? { retry_preset: retryPreset } : {}),
        ...(maxConcurrent ? { max_concurrent_pipelines: maxConcurrent } : {}),
      },
    };

    // Create workspace
    const workspaceName = workspace || `scan-${Date.now()}`;
    const workspaceState = await createWorkspace(workspaceName, url, repo, config);

    // Start the pipeline
    await startPipeline(workspaceName);

    return NextResponse.json({
      success: true,
      scanId: workspaceState.id,
      workspace: workspaceName,
      pipeline: workspaceState.pipeline,
      message: 'Scan started successfully. Pipeline is running.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start scan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
