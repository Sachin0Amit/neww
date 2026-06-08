import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/ai-sdk'
import { isOk } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    backends: [
      { id: 'ai-tts', name: 'AI Text-to-Speech', description: 'Generate speech from text' },
    ],
    voices: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
      { id: 'echo', name: 'Echo', description: 'Warm, conversational' },
      { id: 'fable', name: 'Fable', description: 'Expressive, storytelling' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
      { id: 'nova', name: 'Nova', description: 'Friendly, energetic' },
      { id: 'shimmer', name: 'Shimmer', description: 'Clear, professional' },
    ],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, voice, speed, format } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const result = await textToSpeech({
      text,
      voice: voice || 'alloy',
      speed: speed || 1.0,
      format: format || 'mp3',
    })

    if (isOk(result)) {
      return NextResponse.json({
        success: true,
        voice: voice || 'alloy',
        format: format || 'mp3',
      })
    }

    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      error: 'Audio generation failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
