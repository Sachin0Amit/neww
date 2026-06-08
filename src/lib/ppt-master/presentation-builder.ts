/**
 * PPT Master - Presentation Builder
 * Converts our slide data into actual PPTX files using pptxgenjs.
 * Applies template colors, fonts, layouts, adds charts/tables/images.
 */

import PptxGenJS from 'pptxgenjs'
import { getCanvasFormat, getDesignSpec, getTemplatePreset } from './template-system'
import type {
  Presentation,
  Slide,
  DesignSpec,
  CanvasFormat,
  ChartType,
  SlideType,
  SlideLayout,
} from './types'
import { type Result, ok, err } from '@/lib/types'
import path from 'path'
import { promises as fs } from 'fs'

// =================== PPTX Builder ===================

/** Build a PPTX file from a Presentation object */
export async function buildPPTX(
  presentation: Presentation,
  outputPath?: string,
): Promise<Result<string>> {
  try {
    const pptx = new PptxGenJS()
    const canvasInfo = getCanvasFormat(presentation.canvasFormat)
    const design = presentation.design

    // Configure presentation
    pptx.layout = getLayoutDefinition(presentation.canvasFormat)
    pptx.author = presentation.author
    pptx.title = presentation.title
    pptx.subject = presentation.title

    // Define theme colors
    pptx.defineSlideMaster({
      title: 'DEFAULT_MASTER',
      background: { color: hexToPptxColor(design.backgroundColor) },
      objects: [],
    })

    // Generate each slide
    for (const slide of presentation.slides) {
      await addSlide(pptx, slide, design, canvasInfo)
    }

    // Save to file
    let filePath = outputPath
    if (!filePath) {
      const dir = '/home/z/my-project/workspaces/ppt-master/exports'
      await fs.mkdir(dir, { recursive: true })
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const safeName = presentation.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_').slice(0, 40)
      filePath = path.join(dir, `${safeName}_${timestamp}.pptx`)
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    await pptx.writeFile({ fileName: filePath })

    return ok(filePath)
  } catch (error) {
    return err({
      type: 'filesystem' as const,
      message: `Failed to build PPTX: ${error instanceof Error ? error.message : String(error)}`,
      retryable: false,
      timestamp: new Date().toISOString(),
    })
  }
}

/** Build PPTX as a Buffer (for direct download) */
export async function buildPPTXBuffer(
  presentation: Presentation,
): Promise<Result<Buffer>> {
  try {
    const pptx = new PptxGenJS()
    const canvasInfo = getCanvasFormat(presentation.canvasFormat)
    const design = presentation.design

    pptx.layout = getLayoutDefinition(presentation.canvasFormat)
    pptx.author = presentation.author
    pptx.title = presentation.title

    pptx.defineSlideMaster({
      title: 'DEFAULT_MASTER',
      background: { color: hexToPptxColor(design.backgroundColor) },
      objects: [],
    })

    for (const slide of presentation.slides) {
      await addSlide(pptx, slide, design, canvasInfo)
    }

    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    return ok(buffer)
  } catch (error) {
    return err({
      type: 'filesystem' as const,
      message: `Failed to build PPTX buffer: ${error instanceof Error ? error.message : String(error)}`,
      retryable: false,
      timestamp: new Date().toISOString(),
    })
  }
}

// =================== Slide Rendering ===================

/** Add a single slide to the presentation */
async function addSlide(
  pptx: PptxGenJS,
  slide: Slide,
  design: DesignSpec,
  canvasInfo: { width: number; height: number },
): Promise<void> {
  const pptSlide = pptx.addSlide()

  // Set background
  const bgColor = slide.backgroundColor || design.backgroundColor
  pptSlide.background = { color: hexToPptxColor(bgColor) }

  // Determine if this is a dark background
  const isDarkBg = isColorDark(bgColor)
  const textCol = isDarkBg ? 'FFFFFF' : hexToPptxColor(design.textColor)
  const accentCol = hexToPptxColor(design.accentColor)
  const secondaryCol = hexToPptxColor(design.secondaryColor)

  // Render based on slide type/layout
  switch (slide.type) {
    case 'title':
      renderTitleSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    case 'section':
      renderSectionSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    case 'conclusion':
      renderConclusionSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    case 'chart':
      renderChartSlide(pptSlide, slide, design, textCol, accentCol, secondaryCol, isDarkBg)
      break
    case 'comparison':
      renderComparisonSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    case 'quote':
      renderQuoteSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    case 'image':
      renderImageSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
      break
    default:
      renderContentSlide(pptSlide, slide, design, textCol, accentCol, isDarkBg)
  }

  // Add image if available
  if (slide.imageData) {
    try {
      pptSlide.addImage({
        data: `image/png;base64,${slide.imageData}`,
        x: getImagePosition(slide.layout).x,
        y: getImagePosition(slide.layout).y,
        w: getImagePosition(slide.layout).w,
        h: getImagePosition(slide.layout).h,
        sizing: { type: 'contain', w: getImagePosition(slide.layout).w, h: getImagePosition(slide.layout).h },
      })
    } catch {
      // Image embedding failed — skip gracefully
    }
  }

  // Add speaker notes
  if (slide.notes) {
    pptSlide.addNotes(slide.notes)
  }
}

// =================== Slide Type Renderers ===================

function renderTitleSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Accent bar at top
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: accentCol },
  })

  // Title
  pptSlide.addText(slide.title, {
    x: 0.8, y: 1.5, w: 8.4, h: 1.8,
    fontSize: 36,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
    valign: 'bottom',
  })

  // Subtitle
  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.8, y: 3.5, w: 8.4, h: 0.8,
      fontSize: 18,
      fontFace: design.bodyFont,
      color: textCol,
      valign: 'top',
    })
  }

  // Divider line
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0.8, y: 3.3, w: 2, h: 0.04,
    fill: { color: accentCol },
  })
}

function renderSectionSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Accent bar on left
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.15, h: '100%',
    fill: { color: accentCol },
  })

  // Section title
  pptSlide.addText(slide.title, {
    x: 0.8, y: 2, w: 8.4, h: 1.5,
    fontSize: 32,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
  })

  // Content as subtitle
  if (slide.content.length > 0) {
    pptSlide.addText(slide.content.join(' | '), {
      x: 0.8, y: 3.7, w: 8.4, h: 0.6,
      fontSize: 14,
      fontFace: design.bodyFont,
      color: textCol,
      valign: 'top',
    })
  }
}

function renderContentSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Header bar
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0, y: 0, w: '100%', h: 0.9,
    fill: { color: hexToPptxColor(isDarkBg ? design.primaryColor : design.backgroundColor) },
  })

  // Title in header
  pptSlide.addText(slide.title, {
    x: 0.6, y: 0.1, w: 8.8, h: 0.7,
    fontSize: 22,
    fontFace: design.titleFont,
    color: isDarkBg ? textCol : hexToPptxColor(design.primaryColor),
    bold: true,
    valign: 'middle',
  })

  // Accent underline
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0.6, y: 0.9, w: 1.5, h: 0.04,
    fill: { color: accentCol },
  })

  // Bullet content
  if (slide.content.length > 0) {
    const bodyText = slide.content.map((point, i) => ({
      text: point,
      options: {
        fontSize: 16,
        fontFace: design.bodyFont,
        color: textCol,
        bullet: { type: 'bullet', style: '●' },
        paraSpaceAfter: 8,
        lineSpacingMultiple: 1.3,
      },
    }))

    pptSlide.addText(bodyText, {
      x: 0.8, y: 1.3, w: 8.4, h: 4.5,
      valign: 'top',
    })
  }
}

function renderChartSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  secondaryCol: string,
  isDarkBg: boolean,
): void {
  // Title
  pptSlide.addText(slide.title, {
    x: 0.6, y: 0.3, w: 8.8, h: 0.7,
    fontSize: 22,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
  })

  // Chart
  if (slide.chart) {
    const chartType = mapChartType(slide.chart.type)
    const chartColors = [accentCol, secondaryCol, hexToPptxColor(design.primaryColor)]

    pptSlide.addChart(chartType, slide.chart.series.map((s, si) => ({
      name: s.name,
      labels: slide.chart!.categories,
      values: s.values,
    })), {
      x: 0.6, y: 1.2, w: 8.8, h: 4.2,
      showTitle: true,
      title: slide.chart.title,
      titleFontSize: 12,
      titleColor: textCol,
      showValue: true,
      valueFontSize: 10,
      catAxisLabelColor: textCol,
      valAxisLabelColor: textCol,
      chartColors: chartColors,
      fill: hexToPptxColor(design.backgroundColor),
    })
  }

  // Additional text below chart
  if (slide.content.length > 0) {
    pptSlide.addText(slide.content.map(point => ({
      text: point,
      options: {
        fontSize: 12,
        fontFace: design.bodyFont,
        color: textCol,
        bullet: { type: 'bullet', style: '→' },
      },
    })), {
      x: 0.6, y: 5.6, w: 8.8, h: 1.2,
      valign: 'top',
    })
  }
}

function renderComparisonSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Title
  pptSlide.addText(slide.title, {
    x: 0.6, y: 0.3, w: 8.8, h: 0.7,
    fontSize: 22,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
  })

  // Split content into two columns
  const midPoint = Math.ceil(slide.content.length / 2)
  const leftContent = slide.content.slice(0, midPoint)
  const rightContent = slide.content.slice(midPoint)

  // Left column background
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0.4, y: 1.2, w: 4.4, h: 4.6,
    fill: { color: hexToPptxColor(isDarkBg ? lightenColor(design.primaryColor, 20) : lightenColor(design.backgroundColor, -5)) },
    rectRadius: 0.1,
  })

  // Right column background
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 5.2, y: 1.2, w: 4.4, h: 4.6,
    fill: { color: hexToPptxColor(isDarkBg ? lightenColor(design.secondaryColor, 20) : lightenColor(design.backgroundColor, -10)) },
    rectRadius: 0.1,
  })

  // Left content
  if (leftContent.length > 0) {
    pptSlide.addText(leftContent.map(point => ({
      text: point,
      options: {
        fontSize: 14,
        fontFace: design.bodyFont,
        color: textCol,
        bullet: { type: 'bullet', style: '●' },
        paraSpaceAfter: 6,
      },
    })), {
      x: 0.7, y: 1.5, w: 3.8, h: 4,
      valign: 'top',
    })
  }

  // Right content
  if (rightContent.length > 0) {
    pptSlide.addText(rightContent.map(point => ({
      text: point,
      options: {
        fontSize: 14,
        fontFace: design.bodyFont,
        color: textCol,
        bullet: { type: 'bullet', style: '●' },
        paraSpaceAfter: 6,
      },
    })), {
      x: 5.5, y: 1.5, w: 3.8, h: 4,
      valign: 'top',
    })
  }
}

function renderQuoteSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Large quote mark
  pptSlide.addText('"', {
    x: 1, y: 0.5, w: 2, h: 2,
    fontSize: 80,
    fontFace: design.titleFont,
    color: accentCol,
    bold: true,
    valign: 'top',
  })

  // Quote text
  const quoteText = slide.content.join(' ')
  pptSlide.addText(quoteText, {
    x: 1.5, y: 2, w: 7, h: 2.5,
    fontSize: 22,
    fontFace: design.titleFont,
    color: textCol,
    italic: true,
    valign: 'middle',
  })

  // Attribution (from subtitle)
  if (slide.subtitle) {
    pptSlide.addText(`— ${slide.subtitle}`, {
      x: 1.5, y: 4.8, w: 7, h: 0.6,
      fontSize: 14,
      fontFace: design.bodyFont,
      color: accentCol,
      align: 'right',
    })
  }
}

function renderImageSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Title
  pptSlide.addText(slide.title, {
    x: 0.6, y: 0.3, w: 8.8, h: 0.7,
    fontSize: 22,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
  })

  // If we have an image, it's added separately; show content on left side
  if (slide.content.length > 0) {
    pptSlide.addText(slide.content.map(point => ({
      text: point,
      options: {
        fontSize: 14,
        fontFace: design.bodyFont,
        color: textCol,
        bullet: { type: 'bullet', style: '●' },
        paraSpaceAfter: 6,
      },
    })), {
      x: 0.6, y: 1.2, w: 4, h: 4.8,
      valign: 'top',
    })
  }

  // Placeholder for image area
  if (!slide.imageData) {
    pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
      x: 5, y: 1.2, w: 4.4, h: 4.8,
      fill: { color: hexToPptxColor(isDarkBg ? lightenColor(design.primaryColor, 30) : 'F0F0F0') },
      rectRadius: 0.1,
    })
    pptSlide.addText('Image', {
      x: 5, y: 1.2, w: 4.4, h: 4.8,
      fontSize: 14,
      color: isDarkBg ? '888888' : 'AAAAAA',
      align: 'center',
      valign: 'middle',
    })
  }
}

function renderConclusionSlide(
  pptSlide: PptxGenJS.Slide,
  slide: Slide,
  design: DesignSpec,
  textCol: string,
  accentCol: string,
  isDarkBg: boolean,
): void {
  // Accent bar at top
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: accentCol },
  })

  // Title
  pptSlide.addText(slide.title, {
    x: 0.8, y: 0.5, w: 8.4, h: 1,
    fontSize: 28,
    fontFace: design.titleFont,
    color: textCol,
    bold: true,
  })

  // Divider
  pptSlide.addShape(pptSlide.shapes.RECTANGLE, {
    x: 0.8, y: 1.6, w: 2, h: 0.04,
    fill: { color: accentCol },
  })

  // Key takeaways
  if (slide.content.length > 0) {
    pptSlide.addText(slide.content.map((point, i) => ({
      text: `${i + 1}.  ${point}`,
      options: {
        fontSize: 16,
        fontFace: design.bodyFont,
        color: textCol,
        paraSpaceAfter: 10,
        lineSpacingMultiple: 1.4,
      },
    })), {
      x: 0.8, y: 2, w: 8.4, h: 3.5,
      valign: 'top',
    })
  }
}

// =================== Chart Mapping ===================

function mapChartType(type: ChartType): PptxGenJS.CHART_NAME {
  switch (type) {
    case 'bar': return PptxGenJS.charts.BAR
    case 'line': return PptxGenJS.charts.LINE
    case 'pie': return PptxGenJS.charts.PIE
    case 'doughnut': return PptxGenJS.charts.DOUGHNUT
    default: return PptxGenJS.charts.BAR
  }
}

// =================== Layout Helpers ===================

function getLayoutDefinition(format: CanvasFormat): 'LAYOUT_WIDE' | 'LAYOUT_4x3' | { name: string; width: number; height: number } {
  switch (format) {
    case 'ppt169': return 'LAYOUT_WIDE'
    case 'ppt43': return 'LAYOUT_4x3'
    default: {
      const info = getCanvasFormat(format)
      // pptxgenjs uses inches, we have pixels. 96 DPI
      return {
        name: format,
        width: info.width / 96,
        height: info.height / 96,
      }
    }
  }
}

function getImagePosition(layout: SlideLayout): { x: number; y: number; w: number; h: number } {
  switch (layout) {
    case 'image-focused':
      return { x: 5, y: 1.2, w: 4.4, h: 4.8 }
    case 'two-column':
      return { x: 5, y: 1.2, w: 4.4, h: 3 }
    default:
      return { x: 5.2, y: 1.2, w: 4.2, h: 4.5 }
  }
}

// =================== Color Utilities ===================

/** Convert hex color (e.g., "#FF5500" or "FF5500") to pptxgenjs format (no #) */
function hexToPptxColor(hex: string): string {
  return hex.replace('#', '')
}

/** Check if a hex color is dark */
function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

/** Lighten or darken a hex color by a percentage */
function lightenColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  let r = parseInt(clean.substring(0, 2), 16)
  let g = parseInt(clean.substring(2, 4), 16)
  let b = parseInt(clean.substring(4, 6), 16)

  if (amount > 0) {
    r = Math.min(255, r + Math.round((255 - r) * (amount / 100)))
    g = Math.min(255, g + Math.round((255 - g) * (amount / 100)))
    b = Math.min(255, b + Math.round((255 - b) * (amount / 100)))
  } else {
    const factor = 1 + amount / 100
    r = Math.max(0, Math.round(r * factor))
    g = Math.max(0, Math.round(g * factor))
    b = Math.max(0, Math.round(b * factor))
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
