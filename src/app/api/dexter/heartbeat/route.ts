import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    enabled: true,
    intervalMinutes: 10,
    activeHours: { start: '09:30', end: '16:00', timezone: 'America/New_York', daysOfWeek: [1, 2, 3, 4, 5] },
    lastCheck: '2025-01-16T09:30:00Z',
    nextCheck: '2025-01-16T09:40:00Z',
    lastStatus: 'ok',
    checklist: [
      { item: 'S&P 500 moves > 2%', status: 'checked', value: '+0.4%' },
      { item: 'NASDAQ moves > 2%', status: 'checked', value: '+0.6%' },
      { item: 'Dow moves > 2%', status: 'checked', value: '+0.3%' },
      { item: 'Breaking financial news', status: 'checked', value: 'None' },
      { item: 'Portfolio price alerts', status: 'checked', value: 'AAPL approaching $200' },
    ],
  })
}
