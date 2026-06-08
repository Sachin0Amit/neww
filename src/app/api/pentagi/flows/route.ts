import { NextRequest, NextResponse } from 'next/server'
import { runFlow } from '@/lib/pentagi'
import { isErr } from '@/lib/types'

export async function GET() {
  try {
    return NextResponse.json({ flows: [], count: 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list flows', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
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
    return NextResponse.json({ error: 'Flow creation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
