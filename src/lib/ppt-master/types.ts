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
