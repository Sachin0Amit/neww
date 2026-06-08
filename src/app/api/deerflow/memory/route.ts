/**
 * DeerFlow - Memory API Route
 * GET: Get memory entries for a thread (with optional relevance query)
 * DELETE: Clear all memory for a thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemory, getRelevantMemory, clearMemory } from '@/lib/deerflow/memory-manager';
import { threadExists } from '@/lib/deerflow/thread-manager';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '5', 10);

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId query parameter is required' },
        { status: 400 },
      );
    }

    // Check thread exists
    const exists = await threadExists(threadId);
    if (!exists) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 },
      );
    }

    let entries;
    if (query) {
      // Return relevant memories based on query
      entries = await getRelevantMemory(threadId, query, topK);
    } else {
      // Return all memories for the thread
      entries = await getMemory(threadId);
    }

    return NextResponse.json({ threadId, entries, total: entries.length });
  } catch (error) {
    console.error('[DeerFlow Memory] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId query parameter is required' },
        { status: 400 },
      );
    }

    const cleared = await clearMemory(threadId);

    if (!cleared) {
      return NextResponse.json(
        { error: 'No memory found for this thread or already cleared' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, threadId });
  } catch (error) {
    console.error('[DeerFlow Memory] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear memory', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
