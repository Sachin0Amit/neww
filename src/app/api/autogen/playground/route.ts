import { NextRequest, NextResponse } from 'next/server'
import { runPlayground, listAgents } from '@/lib/autogen'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, rounds } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const result = await runPlayground(topic, rounds || 3)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Playground failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const agents = await listAgents()
    return NextResponse.json({ agents, count: agents.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list agents', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
