import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = (searchParams.get('symbol') || 'AAPL').toUpperCase()

    const fundamentals = {
      symbol, name: symbol === 'AAPL' ? 'Apple Inc.' : symbol === 'NVDA' ? 'NVIDIA Corp.' : `${symbol} Corp.`,
      marketCap: symbol === 'AAPL' ? '3.08T' : symbol === 'NVDA' ? '2.19T' : '128.5B',
      pe: symbol === 'AAPL' ? 32.4 : symbol === 'NVDA' ? 68.2 : 22.8,
      forwardPE: symbol === 'AAPL' ? 28.1 : symbol === 'NVDA' ? 42.5 : 19.3,
      ps: symbol === 'AAPL' ? 7.9 : 18.4,
      pb: symbol === 'AAPL' ? 48.2 : 42.8,
      dividend: symbol === 'AAPL' ? 0.52 : 0.003,
      dividendYield: symbol === 'AAPL' ? 0.56 : 0.03,
      eps: symbol === 'AAPL' ? 6.13 : 13.04,
      revenue: symbol === 'AAPL' ? '391.0B' : '60.9B',
      grossMargin: symbol === 'AAPL' ? 46.2 : 72.7,
      operatingMargin: symbol === 'AAPL' ? 31.5 : 55.0,
      roe: symbol === 'AAPL' ? 147.9 : 115.2,
    }

    const technicals = {
      rsi14: 62.4, macd: { value: 2.18, signal: 1.92, histogram: 0.26 },
      sma: { sma20: 192.34, sma50: 186.78, sma200: 175.42 },
      ema: { ema12: 196.82, ema26: 190.15 },
      bollingerBands: { upper: 208.5, middle: 194.2, lower: 179.9 },
      support: [192.50, 185.00, 178.30], resistance: [200.00, 210.50, 225.00],
      trend: 'BULLISH', momentum: 'POSITIVE',
    }

    const analystRatings = {
      consensus: 'BUY', priceTarget: { low: 165.0, mean: 210.50, high: 250.0, current: 198.45 },
      distribution: { strongBuy: 22, buy: 14, hold: 6, sell: 1, strongSell: 0 },
      recentNotes: [
        { firm: 'Morgan Stanley', rating: 'OVERWEIGHT', target: 220, date: '2025-02-28' },
        { firm: 'Goldman Sachs', rating: 'BUY', target: 235, date: '2025-02-25' },
        { firm: 'J.P. Morgan', rating: 'NEUTRAL', target: 195, date: '2025-02-20' },
      ],
    }

    return NextResponse.json({ fundamentals, technicals, analystRatings, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch research data', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
