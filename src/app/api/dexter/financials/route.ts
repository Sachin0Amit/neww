import { NextRequest, NextResponse } from 'next/server'
import { getIncomeStatement, getBalanceSheet, getCashFlow, getKeyRatios, getEarnings } from '@/lib/dexter'
import { isOk } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker') || 'AAPL'
    const type = searchParams.get('type') || 'income'

    let result

    switch (type) {
      case 'balance':
        result = await getBalanceSheet(ticker)
        break
      case 'cashflow':
        result = await getCashFlow(ticker)
        break
      case 'ratios':
        result = await getKeyRatios(ticker)
        break
      case 'earnings':
        result = await getEarnings(ticker)
        break
      case 'income':
      default:
        result = await getIncomeStatement(ticker)
        break
    }

    if (isOk(result)) {
      return NextResponse.json({
        ticker,
        type,
        data: result.value,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      error: 'Financial data fetch failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
