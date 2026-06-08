import { NextRequest, NextResponse } from 'next/server'
import { analyzeUrl } from '@/lib/mirofish'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url } = body
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    const result = await analyzeUrl(url)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
