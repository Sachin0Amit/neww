import { NextRequest, NextResponse } from 'next/server'
import { loadSettings, updateSettings } from '@/lib/dexter'

export async function GET() {
  try {
    const settings = await loadSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load settings',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const settings = await updateSettings(body)
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json({
      error: 'Settings update failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
