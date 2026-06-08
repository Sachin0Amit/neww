/**
 * DeerFlow - Skill Detail API Route
 * PATCH: Toggle a skill's enabled state
 * DELETE: Delete a custom skill (built-in skills cannot be deleted)
 */

import { NextRequest, NextResponse } from 'next/server';
import { toggleSkill, deleteSkill, getSkill } from '@/lib/deerflow/skills-registry';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Field "enabled" must be a boolean' },
        { status: 400 },
      );
    }

    const skill = await toggleSkill(id, enabled);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error('[DeerFlow Skill] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update skill', details: error instanceof Error ? error.message : 'Unknown' },
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

    // Check if it's a built-in skill
    const skill = await getSkill(id);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 },
      );
    }

    if (skill.isBuiltIn) {
      return NextResponse.json(
        { error: 'Cannot delete built-in skills. Use PATCH to disable them instead.' },
        { status: 403 },
      );
    }

    const deleted = await deleteSkill(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete skill' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, skillId: id });
  } catch (error) {
    console.error('[DeerFlow Skill] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
