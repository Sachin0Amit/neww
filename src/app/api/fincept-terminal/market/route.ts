import { NextResponse } from 'next/server'
import { getMarketOverview } from '@/lib/fincept-terminal'

export async function GET() {
  try {
    const result = await getMarketOverview()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Market data fetch failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
