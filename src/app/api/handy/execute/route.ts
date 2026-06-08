import { NextRequest, NextResponse } from 'next/server'
import { executeTool, listTools } from '@/lib/handy'

export async function GET() {
  try {
    const tools = await listTools()
    return NextResponse.json({ tools, count: tools.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list tools' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { toolId, input, options } = body
    if (!toolId || !input) return NextResponse.json({ error: 'toolId and input are required' }, { status: 400 })
    const result = await executeTool(toolId, input, options)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Tool execution failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
