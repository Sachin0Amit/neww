import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-sdk'
import { isOk } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    backends: [
      { id: 'ai-generation', name: 'AI Image Generation', description: 'Generate images from text prompts' },
      { id: 'web-search', name: 'Web Image Search', description: 'Search for images on the web' },
    ],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, size } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateImage({
      prompt,
      size: size || '1024x1024',
    })

    if (isOk(result)) {
      return NextResponse.json({
        success: true,
        imageBase64: result.value.imageBase64,
        prompt,
      })
    }

    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      error: 'Image generation failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
