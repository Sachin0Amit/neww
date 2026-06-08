import { NextRequest, NextResponse } from 'next/server'
import { getStockPrice, getCryptoPrice, getMarketIndices, getSectorPerformance, getTopMovers } from '@/lib/dexter'
import { isOk } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker')
    const crypto = searchParams.get('crypto')

    if (ticker) {
      const result = await getStockPrice(ticker)
      if (isOk(result)) {
        return NextResponse.json({ type: 'stock', data: result.value })
      }
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
    }

    if (crypto) {
      const result = await getCryptoPrice(crypto)
      if (isOk(result)) {
        return NextResponse.json({ type: 'crypto', data: result.value })
      }
      return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 })
    }

    // Default: return market overview
    const [indices, sectors, movers] = await Promise.all([
      getMarketIndices(),
      getSectorPerformance(),
      getTopMovers(),
    ])

    return NextResponse.json({
      indices: isOk(indices) ? indices.value : [],
      sectors: isOk(sectors) ? sectors.value : [],
      movers: isOk(movers) ? movers.value : [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Market data fetch failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
