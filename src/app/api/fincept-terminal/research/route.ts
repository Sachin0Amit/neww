import { NextRequest, NextResponse } from 'next/server'
import { researchFundamentals, researchTechnicals, researchAnalyst, generateResearchReport } from '@/lib/fincept-terminal'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker') || 'AAPL'
    const type = searchParams.get('type') || 'all'

    if (type === 'all') {
      const report = await generateResearchReport(ticker)
      return NextResponse.json({ ticker, type: 'all', report: report.ok ? (report as any).value : 'Report generation failed' })
    }

    switch (type) {
      case 'fundamental': {
        const result = await researchFundamentals(ticker)
        return NextResponse.json({ ticker, type, data: result.ok ? (result as any).value : null })
      }
      case 'technical': {
        const result = await researchTechnicals(ticker)
        return NextResponse.json({ ticker, type, data: result.ok ? (result as any).value : null })
      }
      case 'analyst': {
        const result = await researchAnalyst(ticker)
        return NextResponse.json({ ticker, type, data: result.ok ? (result as any).value : null })
      }
      default:
        return NextResponse.json({ error: 'Invalid type. Use: fundamental, technical, analyst, all' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Research failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
