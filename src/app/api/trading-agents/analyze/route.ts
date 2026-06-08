import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticker } = body

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 })
    }

    const votes = [
      { agent: 'TechnicalAnalyst', vote: 'BUY', confidence: 82, reason: 'Bullish MACD crossover with rising RSI at 62' },
      { agent: 'FundamentalAnalyst', vote: 'HOLD', confidence: 68, reason: 'Fair valuation at current P/E, moderate growth outlook' },
      { agent: 'SentimentAnalyzer', vote: 'BUY', confidence: 75, reason: 'Positive social sentiment, news flow improving' },
      { agent: 'MomentumTrader', vote: 'BUY', confidence: 88, reason: 'Strong uptrend, price above all major moving averages' },
      { agent: 'ValueInvestor', vote: 'SELL', confidence: 54, reason: 'Trading above intrinsic value estimate, margin of safety thin' },
      { agent: 'RiskManager', vote: 'HOLD', confidence: 71, reason: 'Acceptable risk-reward, VIX moderate, position sizing nominal' },
      { agent: 'OptionsStrategist', vote: 'BUY', confidence: 66, reason: 'IV rank low, favorable for covered call or bull spread' },
    ]

    const buyCount = votes.filter((v) => v.vote === 'BUY').length
    const sellCount = votes.filter((v) => v.vote === 'SELL').length
    const holdCount = votes.filter((v) => v.vote === 'HOLD').length
    const consensus = buyCount > sellCount && buyCount > holdCount ? 'BUY' : sellCount > buyCount ? 'SELL' : 'HOLD'
    const avgConfidence = +(votes.reduce((a, v) => a + v.confidence, 0) / votes.length).toFixed(1)

    return NextResponse.json({
      ticker: ticker.toUpperCase(), timestamp: new Date().toISOString(),
      consensus, avgConfidence, voteBreakdown: { buy: buyCount, sell: sellCount, hold: holdCount },
      votes, priceTarget: { current: 198.45, low: 165.0, mid: 215.0, high: 250.0 },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
