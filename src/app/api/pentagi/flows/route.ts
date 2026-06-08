import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const flows = [
      { id: 'flow-001', name: 'Customer Onboarding', status: 'ACTIVE', agents: 4, runs: 128, lastRun: new Date(Date.now() - 3600000).toISOString(), successRate: 96.8 },
      { id: 'flow-002', name: 'Invoice Processing', status: 'ACTIVE', agents: 3, runs: 892, lastRun: new Date(Date.now() - 600000).toISOString(), successRate: 99.1 },
      { id: 'flow-003', name: 'Lead Qualification', status: 'PAUSED', agents: 5, runs: 342, lastRun: new Date(Date.now() - 86400000).toISOString(), successRate: 84.2 },
      { id: 'flow-004', name: 'Content Pipeline', status: 'ACTIVE', agents: 6, runs: 56, lastRun: new Date(Date.now() - 7200000).toISOString(), successRate: 91.4 },
      { id: 'flow-005', name: 'Incident Triage', status: 'DRAFT', agents: 3, runs: 0, lastRun: null, successRate: 0 },
      { id: 'flow-006', name: 'Data ETL Sync', status: 'ACTIVE', agents: 2, runs: 2140, lastRun: new Date(Date.now() - 300000).toISOString(), successRate: 98.7 },
    ]
    return NextResponse.json({ total: flows.length, flows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flows', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, agents, trigger } = body

    if (!name) {
      return NextResponse.json({ error: 'Flow name is required' }, { status: 400 })
    }

    const flow = {
      id: `flow-${Date.now().toString(36)}`, name, description: description || '',
      status: 'DRAFT', agents: agents || [], trigger: trigger || 'MANUAL',
      runs: 0, lastRun: null, successRate: 0, createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, flow }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create flow', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
