/**
 * PPT Master - Type Definitions
 * Complete type system for AI-driven PowerPoint generation.
 */

import type { BaseWorkspaceState, TokenUsage } from '@/lib/types'

// =================== Slide Types ===================

/** Slide type classification */
export type SlideType =
  | 'title'       // Title slide
  | 'content'     // Bullet point content
  | 'image'       // Image-focused slide
  | 'chart'       // Chart/data visualization
  | 'comparison'  // Two-column comparison
  | 'timeline'    // Timeline/process flow
  | 'quote'       // Quote/callout
  | 'conclusion'  // Conclusion/summary
  | 'section'     // Section divider
  | 'blank'       // Blank layout

/** Slide layout options */
export type SlideLayout =
  | 'title-slide'
  | 'content-header'
  | 'two-column'
  | 'chart-focused'
  | 'image-focused'
  | 'numbered-list'
  | 'summary'
  | 'section-divider'
  | 'blank'

/** Chart type for data slides */
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut'

/** A single slide in a presentation */
export interface Slide {
  /** Unique slide ID */
  id: string
  /** Slide type */
  type: SlideType
  /** Slide title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Main content (bullet points, text, etc.) */
  content: string[]
  /** Speaker notes */
  notes: string
  /** Layout template */
  layout: SlideLayout
  /** Chart configuration (if type is chart) */
  chart?: {
    type: ChartType
    title: string
    categories: string[]
    series: Array<{
      name: string
      values: number[]
    }>
  }
  /** Image data (base64) if slide has an image */
  imageData?: string
  /** Image prompt used for generation */
  imagePrompt?: string
  /** Background color override */
  backgroundColor?: string
}

// =================== Design & Theme ===================

/** Design specification for presentation */
export interface DesignSpec {
  /** Primary color (hex) */
  primaryColor: string
  /** Secondary color (hex) */
  secondaryColor: string
  /** Accent color (hex) */
  accentColor: string
  /** Background color (hex) */
  backgroundColor: string
  /** Text color (hex) */
  textColor: string
  /** Title font */
  titleFont: string
  /** Body font */
  bodyFont: string
  /** Design style */
  style: DesignStyle
}

/** Available design styles */
export type DesignStyle = 'consulting' | 'tech' | 'academic' | 'creative' | 'minimal'

/** Canvas format for output */
export type CanvasFormat =
  | 'ppt169'  // 16:9 widescreen
  | 'ppt43'   // 4:3 standard
  | 'wechat'  // WeChat header
  | 'xiaohongshu' // Xiaohongshu
  | 'moments' // Social square
  | 'story'   // Vertical story
  | 'banner'  // Web banner
  | 'a4'      // A4 print

// =================== Template Presets ===================

/** A template preset with predefined design choices */
export interface TemplatePreset {
  /** Template ID */
  id: string
  /** Display name */
  name: string
  /** Description */
  description: string
  /** Template type */
  type: 'brand' | 'layout' | 'deck'
  /** Associated design spec */
  design: DesignSpec
  /** Preview thumbnail URL */
  thumbnailUrl?: string
}

// =================== Generation Config ===================

/** Configuration for presentation generation */
export interface GenerationConfig {
  /** Presentation topic */
  topic: string
  /** Number of slides to generate */
  slideCount: number
  /** Design style */
  style: DesignStyle
  /** Output language */
  language: string
  /** Whether to include AI-generated images */
  includeImages: boolean
  /** Whether to include charts */
  includeCharts: boolean
  /** Canvas format */
  canvasFormat: CanvasFormat
  /** Optional source content for context */
  sourceContent?: string
  /** Optional source type */
  sourceType?: 'text' | 'url' | 'file'
  /** Author name */
  author?: string
  /** Custom template ID */
  templateId?: string
}

// =================== Presentation ===================

/** A complete presentation */
export interface Presentation {
  /** Presentation ID */
  id: string
  /** Title */
  title: string
  /** All slides */
  slides: Slide[]
  /** Design spec */
  design: DesignSpec
  /** Author */
  author: string
  /** Canvas format */
  canvasFormat: CanvasFormat
  /** Language */
  language: string
  /** Created timestamp */
  createdAt: string
}

// =================== Workspace State ===================

/** PPT Master workspace state */
export interface PPTWorkspaceState extends BaseWorkspaceState {
  /** Generation config */
  config: GenerationConfig
  /** Generated presentation (if completed) */
  presentation?: Presentation
  /** Output PPTX file path (if completed) */
  outputFilePath?: string
  /** Pipeline step details */
  pipelineSteps?: PipelineStep[]
  /** Total generation time in ms */
  totalDurationMs?: number
}

/** A single pipeline step */
export interface PipelineStep {
  /** Step name */
  name: string
  /** Step status */
  status: 'pending' | 'running' | 'completed' | 'failed'
  /** Duration in ms */
  durationMs?: number
  /** Error message if failed */
  error?: string
}

// =================== API Types ===================

/** Generate request body */
export interface GenerateRequest {
  topic?: string
  sourceContent?: string
  sourceType?: 'text' | 'url' | 'file'
  canvasFormat?: CanvasFormat
  style?: DesignStyle
  slideCount?: number
  language?: string
  includeImages?: boolean
  includeCharts?: boolean
  author?: string
  templateId?: string
}

/** Generate response */
export interface GenerateResponse {
  workspaceId: string
  workspaceName: string
  status: string
  message: string
}

/** Generation progress response */
export interface ProgressResponse {
  workspaceName: string
  status: string
  progress: {
    currentStep: string
    stepIndex: number
    totalSteps: number
    percent: number
    message?: string
  }
  pipelineSteps?: PipelineStep[]
  presentation?: Presentation
  outputFilePath?: string
}

/** Image generation request */
export interface ImageGenRequest {
  prompt: string
  slideIndex?: number
  size?: string
}

// =================== Pipeline Intermediate Types ===================

/** Step 1: Topic analysis result */
export interface TopicAnalysis {
  /** Main topic identified */
  topic: string
  /** Target audience */
  audience: string
  /** Tone / style guidance */
  tone: string
  /** Key themes / subtopics */
  keyTopics: string[]
  /** Purpose of presentation */
  purpose: string
  /** Suggested slide count range */
  suggestedSlideCount: { min: number; max: number }
  /** Source material summary (if provided) */
  sourceSummary?: string
}

/** Step 2: Slide outline entry */
export interface SlideOutlineEntry {
  /** Slide index (0-based) */
  index: number
  /** Slide type */
  type: SlideType
  /** Title */
  title: string
  /** Key points / bullets */
  keyPoints: string[]
  /** Layout hint */
  layoutHint: SlideLayout
  /** Whether this slide needs an image */
  needsImage: boolean
  /** Whether this slide needs a chart */
  needsChart: boolean
}

/** Step 2: Outline generation result */
export interface OutlineResult {
  /** Presentation title */
  title: string
  /** Subtitle / tagline */
  subtitle: string
  /** Slide outlines */
  slides: SlideOutlineEntry[]
  /** Overall narrative arc description */
  narrativeArc: string
}

/** Step 3: Full slide content */
export interface SlideContent {
  /** Slide index */
  index: number
  /** Title */
  title: string
  /** Subtitle */
  subtitle?: string
  /** Body content as bullet points */
  content: string[]
  /** Speaker notes */
  notes: string
  /** Chart data (if applicable) */
  chartData?: {
    type: ChartType
    title: string
    categories: string[]
    series: Array<{ name: string; values: number[] }>
  }
}

/** Step 3: Content generation result */
export interface ContentResult {
  slides: SlideContent[]
}

/** Step 4: Visual plan for a single slide */
export interface SlideVisualPlan {
  /** Slide index */
  index: number
  /** Whether to include an image */
  hasImage: boolean
  /** Image prompt (if hasImage) */
  imagePrompt?: string
  /** Whether to include a chart */
  hasChart: boolean
  /** Whether this is a comparison slide */
  isComparison: boolean
  /** Whether this is a timeline slide */
  isTimeline: boolean
  /** Suggested visual emphasis */
  emphasis: 'text' | 'visual' | 'data' | 'balanced'
}

/** Step 4: Visual planning result */
export interface VisualPlanResult {
  slides: SlideVisualPlan[]
  /** Image style guidance for AI generation */
  imageStyleGuidance: string
}

/** Step 5: Layout design for a single slide */
export interface SlideLayoutDesign {
  /** Slide index */
  index: number
  /** Applied layout */
  layout: SlideLayout
  /** Background color (hex) */
  backgroundColor: string
  /** Title position and size */
  titlePosition: { x: number; y: number; w: number; h: number }
  /** Content position and size */
  contentPosition: { x: number; y: number; w: number; h: number }
  /** Image position (if applicable) */
  imagePosition?: { x: number; y: number; w: number; h: number }
  /** Chart position (if applicable) */
  chartPosition?: { x: number; y: number; w: number; h: number }
}

/** Step 5: Layout design result */
export interface LayoutDesignResult {
  slides: SlideLayoutDesign[]
}

/** Step 6: Image generation result per slide */
export interface SlideImageResult {
  /** Slide index */
  index: number
  /** Base64 image data */
  imageData?: string
  /** Image prompt used */
  imagePrompt?: string
  /** Whether image generation succeeded */
  success: boolean
  /** Error if failed */
  error?: string
}

/** Step 6: Image generation result */
export interface ImageGenResult {
  slides: SlideImageResult[]
}

/** Complete pipeline context — carries all intermediate results */
export interface PipelineContext {
  /** Original generation config */
  config: GenerationConfig
  /** Workspace name */
  workspaceName: string
  /** Step 1: Topic analysis */
  analysis?: TopicAnalysis
  /** Step 2: Outline */
  outline?: OutlineResult
  /** Step 3: Content */
  content?: ContentResult
  /** Step 4: Visual plan */
  visuals?: VisualPlanResult
  /** Step 5: Layout design */
  layout?: LayoutDesignResult
  /** Step 6: Generated images */
  images?: ImageGenResult
  /** Step 7: Final presentation */
  presentation?: Presentation
  /** Output PPTX file path */
  outputFilePath?: string
  /** Pipeline steps tracking */
  pipelineSteps: PipelineStep[]
  /** Accumulated token usage */
  tokenUsage: TokenUsage
  /** Total duration in ms */
  totalDurationMs: number
}

/** Audio generation request */
export interface AudioGenRequest {
  text: string
  voice?: string
  speed?: number
  format?: 'mp3' | 'wav' | 'pcm' | 'opus'
  slideIndex?: number
}

/** Audio generation result */
export interface AudioGenResult {
  audioData: unknown
  slideIndex?: number
  voice: string
  duration?: number
}
