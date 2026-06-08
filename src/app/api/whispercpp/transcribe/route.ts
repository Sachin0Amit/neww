import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio, generateSpeech, listModels } from '@/lib/whispercpp'

export async function GET() {
  try {
    const models = await listModels()
    return NextResponse.json({ models })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list models' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, audio, text, voice, speed, language } = body

    if (action === 'transcribe' && audio) {
      const result = await transcribeAudio(audio, language)
      return NextResponse.json(result)
    }

    if (action === 'tts' && text) {
      const result = await generateSpeech(text, voice, speed)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Provide action (transcribe/tts) with required data' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Audio processing failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
