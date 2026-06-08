import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker') || 'AAPL'
  const statement = searchParams.get('statement') || 'income' // income | balance | cashflow | ratios | segments | earnings

  const financials: Record<string, unknown> = {
    income: {
      ticker,
      currency: 'USD',
      period: 'annual',
      data: [
        { year: 2024, revenue: 391000000000, costOfRevenue: 210000000000, grossProfit: 181000000000, operatingIncome: 120000000000, netIncome: 97000000000, eps: 6.12, grossMargin: 0.462, operatingMargin: 0.307, netMargin: 0.248 },
        { year: 2023, revenue: 383000000000, costOfRevenue: 214000000000, grossProfit: 169000000000, operatingIncome: 115000000000, netIncome: 95000000000, eps: 5.95, grossMargin: 0.441, operatingMargin: 0.300, netMargin: 0.248 },
        { year: 2022, revenue: 394000000000, costOfRevenue: 223000000000, grossProfit: 171000000000, operatingIncome: 120000000000, netIncome: 99000000000, eps: 6.15, grossMargin: 0.434, operatingMargin: 0.305, netMargin: 0.251 },
      ],
    },
    balance: {
      ticker,
      currency: 'USD',
      data: [
        { year: 2024, totalAssets: 365000000000, currentAssets: 135000000000, cash: 67000000000, totalLiabilities: 290000000000, currentLiabilities: 125000000000, totalEquity: 75000000000, debtToEquity: 1.73, currentRatio: 1.08 },
      ],
    },
    cashflow: {
      ticker,
      currency: 'USD',
      data: [
        { year: 2024, operatingCashFlow: 125000000000, capitalExpenditure: 14500000000, freeCashFlow: 110500000000, dividendPayments: 15000000000, shareBuybacks: 77000000000, fcfMargin: 0.283 },
      ],
    },
    ratios: {
      ticker,
      data: [
        { year: 2024, pe: 32.4, pb: 42.1, ps: 7.9, evEbitda: 24.8, roe: 1.29, roa: 0.265, roic: 0.384, debtToEquity: 1.73, currentRatio: 1.08, grossMargin: 0.462, operatingMargin: 0.307, netMargin: 0.248 },
        { year: 2023, pe: 29.8, pb: 38.5, ps: 7.2, evEbitda: 22.1, roe: 1.27, roa: 0.260, roic: 0.365, debtToEquity: 1.76, currentRatio: 0.99, grossMargin: 0.441, operatingMargin: 0.300, netMargin: 0.248 },
      ],
    },
    segments: {
      ticker,
      data: [
        { segment: 'iPhone', revenue: 200000000000, margin: 0.38, growth: 0.03 },
        { segment: 'Mac', revenue: 30000000000, margin: 0.42, growth: 0.05 },
        { segment: 'iPad', revenue: 28000000000, margin: 0.36, growth: -0.02 },
        { segment: 'Services', revenue: 85000000000, margin: 0.72, growth: 0.14 },
        { segment: 'Wearables', revenue: 40000000000, margin: 0.35, growth: 0.04 },
        { segment: 'Other', revenue: 8000000000, margin: 0.25, growth: 0.08 },
      ],
    },
    earnings: {
      ticker,
      data: [
        { quarter: 'Q4 2024', actual: 2.35, estimate: 2.28, surprise: 0.07, surprisePercent: 3.1 },
        { quarter: 'Q3 2024', actual: 1.64, estimate: 1.58, surprise: 0.06, surprisePercent: 3.8 },
        { quarter: 'Q2 2024', actual: 1.53, estimate: 1.50, surprise: 0.03, surprisePercent: 2.0 },
        { quarter: 'Q1 2024', actual: 2.18, estimate: 2.10, surprise: 0.08, surprisePercent: 3.8 },
      ],
    },
  }

  return NextResponse.json(financials[statement] || financials.income)
}
