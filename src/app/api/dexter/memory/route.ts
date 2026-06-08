import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  return NextResponse.json({
    results: [
      { path: '.dexter/memory/MEMORY.md', snippet: 'User prefers growth stocks over value. Focus on tech sector with revenue growth >15%. Risk tolerance: moderate.', score: 0.92 },
      { path: '.dexter/memory/2025-01-16.md', snippet: 'Analyzed NVDA earnings: strong data center growth, automotive segment lagging. User asked about DCF valuation.', score: 0.85 },
      { path: '.dexter/memory/2025-01-15.md', snippet: 'User interested in AI infrastructure plays. Recommended looking at semiconductor equipment companies.', score: 0.78 },
    ],
    query,
    total: 3,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, content, file } = body

    return NextResponse.json({
      success: true,
      action,
      file: file || '.dexter/memory/MEMORY.md',
      message: `Memory ${action} successful`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update memory', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
