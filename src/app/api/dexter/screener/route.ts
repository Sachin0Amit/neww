import { NextRequest, NextResponse } from 'next/server'
import { screenStocks } from '@/lib/dexter'
import { isOk } from '@/lib/types'
import type { ScreenerFilter } from '@/lib/dexter'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filters } = body as { filters: ScreenerFilter[] }

    if (!filters || !Array.isArray(filters) || filters.length === 0) {
      return NextResponse.json({ error: 'At least one filter is required' }, { status: 400 })
    }

    const result = await screenStocks(filters)

    if (isOk(result)) {
      return NextResponse.json({
        filters,
        results: result.value,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Stock screening failed' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      error: 'Screener failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
