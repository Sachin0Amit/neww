import { NextRequest, NextResponse } from 'next/server'
import { getAccount, placeBuyOrder, placeSellOrder, resetAccount } from '@/lib/fincept-terminal'

export async function GET() {
  try {
    const account = await getAccount()
    return NextResponse.json({ account })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get account', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ticker, shares } = body

    if (action === 'reset') {
      const account = await resetAccount()
      return NextResponse.json({ success: true, account })
    }

    if (!ticker || !shares || shares <= 0) {
      return NextResponse.json({ error: 'Valid ticker and shares are required' }, { status: 400 })
    }

    if (action === 'buy') {
      const order = await placeBuyOrder(ticker, shares)
      return NextResponse.json({ success: true, order })
    }

    if (action === 'sell') {
      const order = await placeSellOrder(ticker, shares)
      return NextResponse.json({ success: true, order })
    }

    return NextResponse.json({ error: 'Invalid action. Use: buy, sell, reset' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Order failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
