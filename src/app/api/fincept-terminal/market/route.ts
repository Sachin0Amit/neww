import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const indices = [
      { symbol: 'SPX', name: 'S&P 500', price: 5892.34, change: +0.42, changePercent: +0.007, volume: '3.2B' },
      { symbol: 'NDX', name: 'NASDAQ 100', price: 21145.8, change: +1.23, changePercent: +0.058, volume: '2.8B' },
      { symbol: 'DJI', name: 'Dow Jones', price: 43218.6, change: -12.5, changePercent: -0.029, volume: '1.1B' },
      { symbol: 'RUT', name: 'Russell 2000', price: 2084.12, change: +8.34, changePercent: +0.401, volume: '890M' },
      { symbol: 'VIX', name: 'CBOE Volatility', price: 14.22, change: -0.68, changePercent: -4.56, volume: '-' },
    ]

    const sectors = [
      { name: 'Technology', change: +1.24, leaders: ['NVDA', 'META', 'AVGO'] },
      { name: 'Healthcare', change: +0.67, leaders: ['LLY', 'UNH', 'JNJ'] },
      { name: 'Financials', change: +0.53, leaders: ['GS', 'JPM', 'MS'] },
      { name: 'Energy', change: -0.89, leaders: ['XOM', 'CVX', 'COP'] },
      { name: 'Consumer Discretionary', change: +0.31, leaders: ['AMZN', 'TSLA', 'HD'] },
      { name: 'Industrials', change: +0.18, leaders: ['CAT', 'UNP', 'HON'] },
    ]

    const topMovers = {
      gainers: [
        { symbol: 'SMCI', name: 'Super Micro', price: 42.18, changePercent: +12.4 },
        { symbol: 'PLTR', name: 'Palantir', price: 78.92, changePercent: +8.67 },
        { symbol: 'MSTR', name: 'MicroStrategy', price: 312.5, changePercent: +7.21 },
        { symbol: 'RIVN', name: 'Rivian', price: 16.84, changePercent: +6.88 },
        { symbol: 'SOFI', name: 'SoFi Tech', price: 14.22, changePercent: +5.92 },
      ],
      losers: [
        { symbol: 'MRNA', name: 'Moderna', price: 38.45, changePercent: -8.34 },
        { symbol: 'SNAP', name: 'Snap Inc.', price: 11.02, changePercent: -6.12 },
        { symbol: 'PYPL', name: 'PayPal', price: 72.18, changePercent: -4.56 },
        { symbol: 'NCLH', name: 'Norwegian', price: 21.34, changePercent: -3.89 },
        { symbol: 'DIS', name: 'Walt Disney', price: 108.9, changePercent: -3.21 },
      ],
    }

    return NextResponse.json({ timestamp: new Date().toISOString(), indices, sectors, topMovers })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
