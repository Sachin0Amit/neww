import { NextRequest, NextResponse } from 'next/server'
import { analyzeResume, findJobMatches } from '@/lib/justhireme'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, resumeText, skills, location } = body

    if (action === 'analyze' && resumeText) {
      const result = await analyzeResume(resumeText)
      return NextResponse.json(result)
    }

    if (action === 'match' && skills) {
      const result = await findJobMatches(skills, location)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Provide action (analyze/match) with required data' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Job matching failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
