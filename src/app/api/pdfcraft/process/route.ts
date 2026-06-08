import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument, transformDocument } from '@/lib/pdfcraft'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, content, transformType, options } = body

    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    if (action === 'analyze') {
      const result = await analyzeDocument(content)
      return NextResponse.json(result)
    }

    if (action === 'transform') {
      const result = await transformDocument(content, transformType || 'summarize', options)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Provide action (analyze/transform)' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
