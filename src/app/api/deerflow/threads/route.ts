/**
 * DeerFlow - Threads API Route
 * GET: List all threads (sorted by most recent)
 * POST: Create a new thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { listThreads, createThread } from '@/lib/deerflow/thread-manager';
import type { CreateThreadRequest } from '@/lib/deerflow/types';

export async function GET() {
  try {
    const threads = await listThreads();
    return NextResponse.json({ threads, total: threads.length });
  } catch (error) {
    console.error('[DeerFlow Threads] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to list threads', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateThreadRequest = await req.json().catch(() => ({}));
    const { title, mode } = body;

    const thread = await createThread({
      title: title || undefined,
      mode,
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('[DeerFlow Threads] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create thread', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
