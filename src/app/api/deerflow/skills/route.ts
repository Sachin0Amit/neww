/**
 * DeerFlow - Skills API Route
 * GET: List all skills (built-in + custom)
 * POST: Create a new custom skill
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSkills, createSkill } from '@/lib/deerflow/skills-registry';
import type { CreateSkillRequest } from '@/lib/deerflow/types';

export async function GET() {
  try {
    const skills = await listSkills();
    return NextResponse.json({ skills, total: skills.length });
  } catch (error) {
    console.error('[DeerFlow Skills] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to list skills', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateSkillRequest = await req.json();
    const { name, description, prompt, category } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 },
      );
    }
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Skill description is required' },
        { status: 400 },
      );
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Skill prompt is required' },
        { status: 400 },
      );
    }
    const validCategories = ['research', 'generation', 'analysis', 'code', 'creative'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Skill category must be one of: ${validCategories.join(', ')}` },
        { status: 400 },
      );
    }

    const skill = await createSkill({ name, description, prompt, category });
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('[DeerFlow Skills] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create skill', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
