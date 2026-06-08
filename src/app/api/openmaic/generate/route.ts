import { NextRequest, NextResponse } from 'next/server'
import { generateCourse } from '@/lib/openmaic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, difficulty, lessonCount } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const result = await generateCourse(topic, difficulty, lessonCount)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Course generation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
