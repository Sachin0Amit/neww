import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = [
      { name: 'Market Intelligence', agents: ['MacroSentinel', 'SectorRotation', 'VolatilityWatch', 'EarningsTracker', 'FlowAnalyzer', 'DarkPoolMonitor'] },
      { name: 'Technical Analysis', agents: ['ChartPattern', 'TrendDetector', 'SupportResistance', 'VolumeProfile', 'MomentumScout', 'FibonacciMaster'] },
      { name: 'Fundamental Analysis', agents: ['ValueHunter', 'GrowthScout', 'DividendAnalyzer', 'BalanceSheetPro', 'CashFlowExpert', 'EarningsWhisper'] },
      { name: 'Risk Management', agents: ['RiskAssessor', 'DrawdownGuard', 'CorrelationTracker', 'VaRCalculator', 'StressTester', 'HedgeStrategist'] },
      { name: 'Alternative Data', agents: ['SentimentMiner', 'NewsRadar', 'SocialListener', 'InsiderTracker', 'SupplyChainIntel', 'SatelliteAnalyst'] },
      { name: 'Options & Derivatives', agents: ['OptionsFlow', 'GreeksMonitor', 'VolSurface', 'IVRanker', 'CoveredCallPro', 'SpreadBuilder'] },
      { name: 'Global Markets', agents: ['ForexSentinel'] },
    ]

    const agents = categories.flatMap((cat) =>
      cat.agents.map((name, idx) => ({
        id: `fincept-${name.toLowerCase()}`,
        name, category: cat.name,
        status: Math.random() > 0.15 ? 'ACTIVE' : 'IDLE',
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        accuracy: +(75 + Math.random() * 20).toFixed(1),
        signals: Math.floor(Math.random() * 50) + 5,
      }))
    )

    return NextResponse.json({ totalAgents: agents.length, agents })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
