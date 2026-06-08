import { NextRequest, NextResponse } from 'next/server'
import { executeTask } from '@/lib/hermes-agent'
import { isErr } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query } = body
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    const result = await executeTask(query)
    if (isErr(result)) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json(result.value)
  } catch (error) {
    return NextResponse.json({ error: 'Task execution failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
