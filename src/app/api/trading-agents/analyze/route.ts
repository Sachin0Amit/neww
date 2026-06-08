import { NextRequest, NextResponse } from 'next/server'
import { runTradingAnalysis, listAgents } from '@/lib/trading-agents'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticker } = body

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
    }

    const result = await runTradingAnalysis(ticker)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const agents = await listAgents()
    return NextResponse.json({ agents, count: agents.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list agents', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
