import { NextRequest, NextResponse } from 'next/server'
import { loadHeartbeat, updateHeartbeatCheck, runHeartbeatChecks } from '@/lib/dexter'

export async function GET() {
  try {
    const checks = await loadHeartbeat()
    return NextResponse.json({ checks, count: checks.length })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load heartbeat',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, checkId, updates } = body

    if (action === 'run') {
      const checks = await runHeartbeatChecks()
      return NextResponse.json({ success: true, checks })
    }

    if (action === 'update' && checkId) {
      const check = await updateHeartbeatCheck(checkId, updates)
      if (!check) {
        return NextResponse.json({ error: 'Check not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, check })
    }

    return NextResponse.json({ error: 'Invalid action. Use "run" or "update"' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({
      error: 'Heartbeat action failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
