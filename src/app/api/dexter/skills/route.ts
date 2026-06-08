import { NextRequest, NextResponse } from 'next/server'
import { listSkills, createSkill } from '@/lib/dexter'

export async function GET() {
  try {
    const skills = await listSkills()
    return NextResponse.json({ skills, count: skills.length })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to list skills',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, prompt, category } = body

    if (!name || !description || !prompt) {
      return NextResponse.json({
        error: 'Name, description, and prompt are required',
      }, { status: 400 })
    }

    const skill = await createSkill({
      name,
      description,
      prompt,
      category: category || 'analysis',
    })

    return NextResponse.json({ success: true, skill }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      error: 'Skill creation failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
