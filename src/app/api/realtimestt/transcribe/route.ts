import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio, listLanguages } from '@/lib/realtimestt'

export async function GET() {
  try {
    const languages = await listLanguages()
    return NextResponse.json({ languages })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list languages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audio, language } = body
    if (!audio) return NextResponse.json({ error: 'Audio base64 data is required' }, { status: 400 })
    const result = await transcribeAudio(audio, language)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Transcription failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
