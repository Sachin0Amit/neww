import { NextRequest, NextResponse } from 'next/server'
import { generateForecast } from '@/lib/kronos'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { target, forecastType, periods } = body

    if (!target) {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 })
    }

    const result = await generateForecast(target, forecastType, periods)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Forecast failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
