import { NextRequest, NextResponse } from 'next/server'
import { listAgents, runFlow } from '@/lib/pentagi'
import { isErr } from '@/lib/types'

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
    const { name, description, query, depth } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const result = await runFlow({ name: name || 'New Flow', description, query, depth })
    if (isErr(result)) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    return NextResponse.json({ error: 'Flow execution failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
