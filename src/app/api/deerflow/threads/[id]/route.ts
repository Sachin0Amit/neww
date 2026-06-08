/**
 * DeerFlow - Thread Detail API Route
 * GET: Get thread detail with messages
 * DELETE: Delete a thread and all its data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThreadWithMessages, deleteThread } from '@/lib/deerflow/thread-manager';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const thread = await getThreadWithMessages(id);

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('[DeerFlow Thread] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get thread', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteThread(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Thread not found or already deleted' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, threadId: id });
  } catch (error) {
    console.error('[DeerFlow Thread] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
