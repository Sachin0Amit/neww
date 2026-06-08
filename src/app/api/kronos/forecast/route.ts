import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticker, days, interval } = body

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
    }

    const numDays = days || 30
    const basePrice = 198.45
    const candles = []
    let price = basePrice * 0.95

    for (let i = numDays; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const change = (Math.random() - 0.45) * 4
      const open = +price.toFixed(2)
      const close = +(price + change).toFixed(2)
      const high = +(Math.max(open, close) + Math.random() * 2).toFixed(2)
      const low = +(Math.min(open, close) - Math.random() * 2).toFixed(2)
      const volume = Math.floor(50_000_000 + Math.random() * 30_000_000)
      candles.push({ date: date.toISOString().split('T')[0], open, high, low, close, volume })
      price = close
    }

    const forecastPrices = []
    let fp = candles[candles.length - 1].close
    for (let i = 1; i <= 14; i++) {
      fp += (Math.random() - 0.4) * 3
      const date = new Date(Date.now() + i * 86400000)
      forecastPrices.push({ date: date.toISOString().split('T')[0], predicted: +fp.toFixed(2), upper: +(fp + 5 + i * 0.5).toFixed(2), lower: +(fp - 5 - i * 0.5).toFixed(2) })
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(), interval: interval || '1d',
      historical: candles, forecast: forecastPrices,
      indicators: { trend: 'BULLISH', targetPrice: +fp.toFixed(2), support: +(fp * 0.93).toFixed(2), resistance: +(fp * 1.08).toFixed(2) },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Forecast failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
