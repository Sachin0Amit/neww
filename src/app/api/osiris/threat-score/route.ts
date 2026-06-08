/**
 * OSIRIS Threat Score API Route
 * POST /api/osiris/threat-score
 *
 * Calculate composite threat scoring for a target based on recon data.
 * Returns weighted scores from each intel source, overall threat level,
 * and a risk matrix with quadrant classification.
 *
 * Request body: { target, reconData }
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateCompositeThreatScore } from '@/lib/osiris/analysis-engine';
import type { ReconResult } from '@/lib/osiris/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { target, reconData } = body as {
      target?: string;
      reconData?: ReconResult[];
    };

    // Validate target
    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { error: 'Target is required for threat scoring', success: false },
        { status: 400 },
      );
    }

    const sanitizedTarget = target.trim();

    // Validate recon data
    if (!reconData || !Array.isArray(reconData) || reconData.length === 0) {
      return NextResponse.json(
        { error: 'Recon data (array of ReconResult) is required. Run /api/osiris/recon first.', success: false },
        { status: 400 },
      );
    }

    // Calculate composite threat score
    const scoreResult = await calculateCompositeThreatScore(sanitizedTarget, reconData);

    if (!scoreResult.ok) {
      return NextResponse.json(
        {
          error: 'Threat scoring failed',
          details: scoreResult.error.message,
          success: false,
        },
        { status: 500 },
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: scoreResult.value,
      meta: {
        durationMs,
        sourcesEvaluated: reconData.filter(r => !r.error).length,
        totalSources: reconData.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Threat scoring failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
