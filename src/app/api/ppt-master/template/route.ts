import { NextResponse } from 'next/server'
import { getTemplatePresets } from '@/lib/ppt-master'

export async function GET() {
  try {
    const templates = getTemplatePresets()
    return NextResponse.json({ templates, count: templates.length })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to list templates',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
