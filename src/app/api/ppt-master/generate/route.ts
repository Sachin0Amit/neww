import { NextRequest, NextResponse } from 'next/server'
import { runGenerationPipeline } from '@/lib/ppt-master'
import { isErr } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, sourceContent, sourceType, canvasFormat, style, slideCount, language, includeImages, includeCharts, author, templateId } = body

    if (!topic && !sourceContent) {
      return NextResponse.json({ error: 'Topic or sourceContent is required' }, { status: 400 })
    }

    const result = await runGenerationPipeline({
      topic,
      sourceContent,
      sourceType,
      canvasFormat,
      style,
      slideCount,
      language,
      includeImages,
      includeCharts,
      author,
      templateId,
    })

    if (isErr(result)) {
      return NextResponse.json({
        error: 'Generation failed',
        details: result.error.message,
      }, { status: 500 })
    }

    const ctx = result.value
    return NextResponse.json({
      workspaceId: ctx.workspaceName,
      workspaceName: ctx.workspaceName,
      status: 'completed',
      message: `Presentation "${ctx.outline?.title}" generated with ${ctx.presentation?.slides.length || 0} slides`,
      presentation: ctx.presentation,
      pipelineSteps: ctx.pipelineSteps,
      totalDurationMs: ctx.totalDurationMs,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
