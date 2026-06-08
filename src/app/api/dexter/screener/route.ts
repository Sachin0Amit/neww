import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filters } = body

    // Simulated stock screener results
    const results = [
      { ticker: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology', marketCap: '3.2T', pe: 52.3, revenueGrowth: 1.22, grossMargin: 0.75, roe: 1.15, price: 131.28, change: 2.8 },
      { ticker: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', marketCap: '3.1T', pe: 35.8, revenueGrowth: 0.16, grossMargin: 0.70, roe: 0.38, price: 417.52, change: 0.9 },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: '1.6T', pe: 28.1, revenueGrowth: 0.22, grossMargin: 0.82, roe: 0.35, price: 618.45, change: 1.5 },
      { ticker: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', marketCap: '2.3T', pe: 24.5, revenueGrowth: 0.14, grossMargin: 0.57, roe: 0.28, price: 189.72, change: 0.6 },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'Consumer Cyclical', marketCap: '2.4T', pe: 42.1, revenueGrowth: 0.11, grossMargin: 0.48, roe: 0.22, price: 229.15, change: -0.3 },
      { ticker: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', marketCap: '820B', pe: 85.2, revenueGrowth: 0.32, grossMargin: 0.80, roe: 0.65, price: 855.20, change: 1.1 },
      { ticker: 'VST', name: 'Vistra Corp', sector: 'Utilities', marketCap: '42B', pe: 22.8, revenueGrowth: 0.18, grossMargin: 0.35, roe: 0.42, price: 142.30, change: 3.2 },
      { ticker: 'COIN', name: 'Coinbase Global', sector: 'Financial', marketCap: '48B', pe: 38.5, revenueGrowth: 0.95, grossMargin: 0.85, roe: 0.25, price: 275.60, change: 4.5 },
    ]

    return NextResponse.json({
      success: true,
      filters: filters || {},
      count: results.length,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run screener', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
