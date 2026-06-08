import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    jobs: [
      {
        id: 'cron-001',
        name: 'AAPL Price Alert',
        schedule: { kind: 'every', everyMs: 3600000 },
        message: 'Check if AAPL crosses $200',
        fulfillmentMode: 'once',
        lastRunAt: '2025-01-16T09:00:00Z',
        nextRunAt: '2025-01-16T10:00:00Z',
        enabled: true,
        alertCount: 0,
      },
      {
        id: 'cron-002',
        name: 'Morning Market Brief',
        schedule: { kind: 'cron', expr: '0 9 * * 1-5', tz: 'America/New_York' },
        message: 'Provide a brief market overview for major indices and any overnight developments',
        fulfillmentMode: 'keep',
        lastRunAt: '2025-01-16T09:00:00Z',
        nextRunAt: '2025-01-17T09:00:00Z',
        enabled: true,
        alertCount: 12,
      },
      {
        id: 'cron-003',
        name: 'BTC Weekly Analysis',
        schedule: { kind: 'cron', expr: '0 18 * * 5', tz: 'UTC' },
        message: 'Weekly Bitcoin on-chain analysis and trend assessment',
        fulfillmentMode: 'keep',
        lastRunAt: '2025-01-10T18:00:00Z',
        nextRunAt: '2025-01-17T18:00:00Z',
        enabled: true,
        alertCount: 4,
      },
    ],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, name, schedule, message, fulfillmentMode } = body

    if (action === 'add') {
      return NextResponse.json({
        success: true,
        job: {
          id: `cron-${Date.now()}`,
          name,
          schedule,
          message,
          fulfillmentMode: fulfillmentMode || 'keep',
          enabled: true,
          nextRunAt: new Date(Date.now() + 60000).toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to manage cron jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
