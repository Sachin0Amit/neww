import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    skills: [
      {
        id: 'dcf-valuation',
        name: 'DCF Valuation',
        description: 'Full discounted cash flow analysis with 8-step workflow: gather data → FCF growth → WACC → project cash flows → PV → sensitivity → validate → present',
        steps: 8,
        category: 'valuation',
      },
      {
        id: 'write-memo',
        name: 'Investment Memo',
        description: 'Draft professional investment memo (HTML output) for long/short equity ideas with 8-step workflow',
        steps: 8,
        category: 'research',
      },
      {
        id: 'x-research',
        name: 'X Research',
        description: 'X/Twitter public sentiment research with structured search decomposition and synthesis',
        steps: 4,
        category: 'sentiment',
      },
    ],
  })
}
