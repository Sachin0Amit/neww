import { NextRequest, NextResponse } from 'next/server'
import { listAgents, runAgent } from '@/lib/fincept-terminal'

export async function GET() {
  try {
    const agents = await listAgents()
    return NextResponse.json({ agents, count: agents.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list agents', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, query } = body

    if (!agentId || !query) {
      return NextResponse.json({ error: 'agentId and query are required' }, { status: 400 })
    }

    const result = await runAgent(agentId, query)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Agent execution failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
