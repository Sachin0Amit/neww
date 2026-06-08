import { NextRequest, NextResponse } from 'next/server'
import { executeDexterAgent } from '@/lib/dexter'
import { isErr } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, mode, skills, context } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const result = await executeDexterAgent({
      message,
      mode: mode || 'default',
      skills,
      context,
    })

    if (isErr(result)) {
      return NextResponse.json({
        error: 'Agent execution failed',
        details: result.error.message,
      }, { status: 500 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    return NextResponse.json({
      error: 'Query failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
