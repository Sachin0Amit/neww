import { NextRequest, NextResponse } from 'next/server'
import { getFilings } from '@/lib/dexter'
import { isOk } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker') || 'AAPL'
    const type = searchParams.get('type') || '10-K'

    const result = await getFilings(ticker, type)

    if (isOk(result)) {
      return NextResponse.json({
        ticker,
        type,
        filings: result.value,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Failed to fetch filings' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      error: 'Filings fetch failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
