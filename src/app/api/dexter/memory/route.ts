import { NextRequest, NextResponse } from 'next/server'
import { searchMemories, getAllMemories, storeMemory, clearMemories } from '@/lib/dexter'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')

    if (query) {
      const results = await searchMemories(query, 10)
      return NextResponse.json({ query, results })
    }

    const entries = await getAllMemories()
    return NextResponse.json({ entries, count: entries.length })
  } catch (error) {
    return NextResponse.json({
      error: 'Memory search failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value, confidence, source, tags } = body

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const entry = await storeMemory(key, value, { confidence, source, tags })
    return NextResponse.json({ success: true, entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      error: 'Memory store failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearMemories()
    return NextResponse.json({ success: true, message: 'All memories cleared' })
  } catch (error) {
    return NextResponse.json({
      error: 'Memory clear failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
