import { NextResponse } from 'next/server'
import { getCanvasFormats, getColorPalettes, getDesignStyles, RENDERING_STYLES } from '@/lib/ppt-master'

export async function GET() {
  try {
    return NextResponse.json({
      canvasFormats: getCanvasFormats(),
      styles: getDesignStyles(),
      colorPalettes: getColorPalettes(),
      renderingStyles: RENDERING_STYLES,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load config',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
