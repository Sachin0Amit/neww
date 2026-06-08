import { NextRequest, NextResponse } from 'next/server'
import { generateVideoFromPrompt } from '@/lib/ltx2'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, quality, duration } = body
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    const result = await generateVideoFromPrompt({ prompt, quality, duration })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Video generation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
