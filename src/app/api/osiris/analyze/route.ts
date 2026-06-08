/**
 * OSIRIS Analyze API Route
 * POST /api/osiris/analyze
 *
 * AI-powered analysis of recon data.
 * Supports three depth levels: surface, moderate, deep.
 *
 * Request body: { target, reconData?, domain?, depth? }
 * - surface: Quick summary of findings
 * - moderate: Summary + threat scoring + recommendations
 * - deep: Full AIAnalysis with risk matrix, confidence scores, related entities
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline } from '@/lib/osiris/analysis-engine';
import type { ReconResult, IntelDomain } from '@/lib/osiris/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { target, reconData, domain, depth } = body as {
      target?: string;
      reconData?: ReconResult[];
      domain?: string;
      depth?: 'surface' | 'moderate' | 'deep';
    };

    // Validate target
    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { error: 'Target is required for analysis', success: false },
        { status: 400 },
      );
    }

    const sanitizedTarget = target.trim();
    const analysisDepth = depth || 'moderate';

    // Validate depth
    if (!['surface', 'moderate', 'deep'].includes(analysisDepth)) {
      return NextResponse.json(
        { error: 'Depth must be "surface", "moderate", or "deep"', success: false },
        { status: 400 },
      );
    }

    // If no recon data provided, we can't do much
    if (!reconData || !Array.isArray(reconData) || reconData.length === 0) {
      return NextResponse.json(
        { error: 'Recon data (array of ReconResult) is required for analysis. Run /api/osiris/recon first.', success: false },
        { status: 400 },
      );
    }

    // Run analysis pipeline
    const pipelineResult = await runAnalysisPipeline(
      sanitizedTarget,
      reconData,
      analysisDepth,
      domain as IntelDomain | undefined,
    );

    if (!pipelineResult.ok) {
      return NextResponse.json(
        {
          error: 'Analysis pipeline failed',
          details: pipelineResult.error.message,
          success: false,
        },
        { status: 500 },
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: pipelineResult.value,
      meta: {
        durationMs,
        depth: analysisDepth,
        sourcesAnalyzed: reconData.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
