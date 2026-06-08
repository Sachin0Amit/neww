import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker') || 'AAPL'
  const type = searchParams.get('type') || '10-K' // 10-K | 10-Q | 8-K
  const section = searchParams.get('section') || '1' // Item number

  const filings: Record<string, unknown> = {
    '10-K': {
      ticker,
      type: '10-K',
      fiscalYear: 2024,
      filedDate: '2024-11-01',
      sections: {
        '1': { title: 'Business', summary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. The Company operates through five segments: iPhone, Mac, iPad, Services, and Wearables. Services includes advertising, AppleCare, cloud, digital content, payment, and licensing services.' },
        '1A': { title: 'Risk Factors', summary: 'Key risks include: dependence on iPhone for majority of revenue, competition in all product categories, supply chain concentration in China, regulatory pressure on App Store practices, global economic conditions affecting consumer spending, and rapid technology changes.' },
        '7': { title: "Management's Discussion and Analysis", summary: 'FY2024 revenue grew 2.1% to $391B, driven by Services growth of 14%. Product revenue was flat due to mixed product cycle dynamics. Gross margin improved to 46.2% from 44.1% due to favorable mix shift toward Services and lower component costs. Operating expenses grew 7% primarily from R&D investments in AI and spatial computing.' },
        '8': { title: 'Financial Statements', summary: 'Total assets: $365B. Cash and equivalents: $67B. Total debt: $130B. Shareholders equity: $75B. Operating cash flow: $125B. Free cash flow: $110.5B.' },
      },
    },
    '10-Q': {
      ticker,
      type: '10-Q',
      fiscalQuarter: 'Q1 FY2025',
      filedDate: '2025-02-01',
      sections: {
        '1': { title: 'Financial Statements', summary: 'Q1 FY2025 revenue: $124.3B (+5.2% YoY). iPhone revenue: $69.7B. Services revenue: $24.2B (+16% YoY). EPS: $2.35.' },
        '2': { title: "Management's Discussion", summary: 'Strong holiday quarter driven by iPhone 16 cycle and continued Services momentum. Apple Intelligence features driving upgrade activity. China showing stabilization after prior year headwinds.' },
      },
    },
    '8-K': {
      ticker,
      type: '8-K',
      filedDate: '2025-01-30',
      event: 'Earnings Release',
      summary: 'Apple reported Q1 FY2025 results: Revenue of $124.3B, up 5.2% year over year. Diluted EPS of $2.35, up 10.8%. Board declared cash dividend of $0.25 per share. Authorized additional $90B share buyback program.',
    },
  }

  const filing = filings[type] || filings['10-K']
  if (section && (filing as Record<string, unknown>).sections) {
    const sections = (filing as Record<string, Record<string, unknown>>).sections as Record<string, unknown>
    return NextResponse.json({ ...filing, requestedSection: sections[section] || null })
  }

  return NextResponse.json(filing)
}
