import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, side, quantity, orderType, price } = body

    if (!symbol || !side || !quantity) {
      return NextResponse.json({ error: 'Symbol, side, and quantity are required' }, { status: 400 })
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`
    const order = {
      orderId, symbol: symbol.toUpperCase(), side, quantity, orderType: orderType || 'MARKET',
      price: orderType === 'LIMIT' ? price : null, status: 'ACCEPTED',
      filledQuantity: 0, avgFillPrice: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, message: 'Order submitted', order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit order', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const positions = [
      { symbol: 'AAPL', quantity: 150, avgPrice: 178.32, currentPrice: 198.45, pnl: +3019.50, pnlPercent: +11.29 },
      { symbol: 'NVDA', quantity: 80, avgPrice: 475.20, currentPrice: 892.15, pnl: +33356.00, pnlPercent: +87.77 },
      { symbol: 'TSLA', quantity: 50, avgPrice: 265.40, currentPrice: 342.15, pnl: +3837.50, pnlPercent: +28.92 },
      { symbol: 'MSFT', quantity: 60, avgPrice: 378.90, currentPrice: 415.28, pnl: +2182.80, pnlPercent: +9.59 },
    ]

    const orders = [
      { orderId: 'ORD-A1B2C3', symbol: 'AAPL', side: 'BUY', quantity: 50, orderType: 'LIMIT', price: 195.00, status: 'PENDING', createdAt: new Date(Date.now() - 120000).toISOString() },
      { orderId: 'ORD-D4E5F6', symbol: 'META', side: 'SELL', quantity: 30, orderType: 'MARKET', price: null, status: 'FILLED', filledQty: 30, avgPrice: 528.40, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { orderId: 'ORD-G7H8I9', symbol: 'GOOGL', side: 'BUY', quantity: 25, orderType: 'LIMIT', price: 170.00, status: 'CANCELLED', createdAt: new Date(Date.now() - 7200000).toISOString() },
    ]

    return NextResponse.json({ positions, orders, account: { cash: 48520.30, buyingPower: 97040.60, totalEquity: 189342.80 } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch positions', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
