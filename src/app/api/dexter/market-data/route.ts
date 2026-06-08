import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker') || 'AAPL'
  const type = searchParams.get('type') || 'stock' // stock | crypto

  if (type === 'crypto') {
    return NextResponse.json({
      type: 'crypto',
      ticker,
      price: 97842.15,
      change24h: 2.3,
      change7d: 5.8,
      marketCap: 1930000000000,
      volume24h: 48200000000,
      high24h: 98500,
      low24h: 95200,
      ath: 99500,
      athDate: '2025-01-15',
      circulatingSupply: 19700000,
      sparkline: Array.from({ length: 24 }, (_, i) => 95000 + Math.random() * 3000),
    })
  }

  return NextResponse.json({
    type: 'stock',
    ticker,
    price: 198.45,
    change: 1.2,
    changePercent: 0.61,
    open: 196.50,
    high: 199.62,
    low: 195.80,
    volume: 54200000,
    avgVolume: 48000000,
    marketCap: 3080000000000,
    pe: 32.4,
    eps: 6.12,
    dividend: 0.96,
    dividendYield: 0.48,
    beta: 1.24,
    week52High: 199.62,
    week52Low: 164.08,
    sharesOutstanding: 15500000000,
    float: 15300000000,
    shortRatio: 1.2,
    shortPercent: 0.007,
    institutionalOwnership: 0.62,
    sparkline: Array.from({ length: 30 }, (_, i) => 180 + Math.random() * 18),
  })
}
