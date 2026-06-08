/**
 * PPT Master - Template System
 * Built-in style presets, color palettes, and font pairings.
 */

import type { DesignSpec, DesignStyle, TemplatePreset, CanvasFormat } from './types'

// =================== Built-in Design Specs ===================

const CONSULTING_DESIGN: DesignSpec = {
  primaryColor: '#1B2A4A',
  secondaryColor: '#2C5282',
  accentColor: '#E53E3E',
  backgroundColor: '#FFFFFF',
  textColor: '#1A202C',
  titleFont: 'Georgia',
  bodyFont: 'Calibri',
  style: 'consulting',
}

const TECH_DESIGN: DesignSpec = {
  primaryColor: '#0F172A',
  secondaryColor: '#3B82F6',
  accentColor: '#10B981',
  backgroundColor: '#F8FAFC',
  textColor: '#1E293B',
  titleFont: 'Segoe UI',
  bodyFont: 'Segoe UI Light',
  style: 'tech',
}

const ACADEMIC_DESIGN: DesignSpec = {
  primaryColor: '#312E81',
  secondaryColor: '#4F46E5',
  accentColor: '#D97706',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleFont: 'Times New Roman',
  bodyFont: 'Calibri',
  style: 'academic',
}

const CREATIVE_DESIGN: DesignSpec = {
  primaryColor: '#7C3AED',
  secondaryColor: '#EC4899',
  accentColor: '#F59E0B',
  backgroundColor: '#FAFAFA',
  textColor: '#111827',
  titleFont: 'Trebuchet MS',
  bodyFont: 'Calibri',
  style: 'creative',
}

const MINIMAL_DESIGN: DesignSpec = {
  primaryColor: '#111827',
  secondaryColor: '#6B7280',
  accentColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleFont: 'Segoe UI',
  bodyFont: 'Segoe UI Light',
  style: 'minimal',
}

/** Map style name to its default design spec */
const STYLE_DESIGNS: Record<DesignStyle, DesignSpec> = {
  consulting: CONSULTING_DESIGN,
  tech: TECH_DESIGN,
  academic: ACADEMIC_DESIGN,
  creative: CREATIVE_DESIGN,
  minimal: MINIMAL_DESIGN,
}

// =================== Built-in Template Presets ===================

const BUILTIN_TEMPLATES: TemplatePreset[] = [
  // Brand templates
  {
    id: 'brand-corporate',
    name: 'Corporate Brand',
    description: 'Professional corporate identity with bold headers and clean layouts',
    type: 'brand',
    design: CONSULTING_DESIGN,
  },
  {
    id: 'brand-startup',
    name: 'Startup Brand',
    description: 'Modern startup aesthetic with vibrant accents',
    type: 'brand',
    design: TECH_DESIGN,
  },
  {
    id: 'brand-academic',
    name: 'Academic Brand',
    description: 'University/institution style with serif fonts',
    type: 'brand',
    design: ACADEMIC_DESIGN,
  },
  // Layout templates
  {
    id: 'layout-title-content',
    name: 'Title + Content',
    description: 'Classic title-content layout',
    type: 'layout',
    design: MINIMAL_DESIGN,
  },
  {
    id: 'layout-two-col',
    name: 'Two Column',
    description: 'Side-by-side comparison layout',
    type: 'layout',
    design: CONSULTING_DESIGN,
  },
  {
    id: 'layout-image-focus',
    name: 'Image Focus',
    description: 'Large image with overlay text',
    type: 'layout',
    design: CREATIVE_DESIGN,
  },
  {
    id: 'layout-chart',
    name: 'Chart Centered',
    description: 'Data visualization layout',
    type: 'layout',
    design: TECH_DESIGN,
  },
  // Deck templates
  {
    id: 'deck-pitch',
    name: 'Pitch Deck',
    description: 'Complete pitch deck template for startups',
    type: 'deck',
    design: TECH_DESIGN,
  },
  {
    id: 'deck-report',
    name: 'Report Deck',
    description: 'Business report template with data focus',
    type: 'deck',
    design: CONSULTING_DESIGN,
  },
  {
    id: 'deck-training',
    name: 'Training Deck',
    description: 'Educational training template with clear sections',
    type: 'deck',
    design: ACADEMIC_DESIGN,
  },
]

// =================== Color Palette Library ===================

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

const COLOR_PALETTES: ColorPalette[] = [
  { id: 'macaron', name: 'Macaron', colors: ['#FFB5E8', '#FF9CEE', '#B5B9FF', '#97C4A8', '#F6F6EB'] },
  { id: 'frost-ice', name: 'Frost & Ice', colors: ['#E8F4FD', '#B8D8E8', '#7FB3D3', '#4A90B8', '#2C5F8A'] },
  { id: 'editorial-classic', name: 'Editorial Classic', colors: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#FFFFFF'] },
  { id: 'jewel-tone', name: 'Jewel Tone', colors: ['#6B21A8', '#BE185D', '#B45309', '#15803D', '#1E3A5F'] },
  { id: 'tech-neon', name: 'Tech Neon', colors: ['#00F5FF', '#7B2FBE', '#FF00E5', '#00FF88', '#0D0D0D'] },
  { id: 'warm-earth', name: 'Warm Earth', colors: ['#8B4513', '#CD853F', '#DEB887', '#F5DEB3', '#FAEBD7'] },
  { id: 'vivid-launch', name: 'Vivid Launch', colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'] },
  { id: 'sunset-gradient', name: 'Sunset Gradient', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF'] },
  { id: 'mono-ink', name: 'Mono Ink', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'] },
  { id: 'cool-corporate', name: 'Cool Corporate', colors: ['#1B3A5C', '#2E6B9E', '#5BA3D9', '#A8D0E6', '#E8F1F8'] },
  { id: 'dark-cinematic', name: 'Dark Cinematic', colors: ['#0D0D0D', '#1A1A2E', '#2D2D44', '#E94560', '#F5F5F5'] },
  { id: 'earthy-dusty', name: 'Earthy Dusty', colors: ['#8B7355', '#C4A77D', '#E8D5B7', '#A0522D', '#2F1B14'] },
  { id: 'nature-organic', name: 'Nature Organic', colors: ['#2D5016', '#558B2F', '#8BC34A', '#CDDC39', '#F0F4C3'] },
]

// =================== Canvas Format Info ===================

export interface CanvasFormatInfo {
  id: CanvasFormat
  name: string
  width: number
  height: number
  isDefault?: boolean
}

const CANVAS_FORMATS: CanvasFormatInfo[] = [
  { id: 'ppt169', name: 'Widescreen (16:9)', width: 1280, height: 720, isDefault: true },
  { id: 'ppt43', name: 'Standard (4:3)', width: 1024, height: 768 },
  { id: 'wechat', name: 'WeChat Header', width: 900, height: 383 },
  { id: 'xiaohongshu', name: 'Xiaohongshu', width: 1242, height: 1660 },
  { id: 'moments', name: 'Social Square', width: 1080, height: 1080 },
  { id: 'story', name: 'Story/Vertical', width: 1080, height: 1920 },
  { id: 'banner', name: 'Web Banner', width: 1920, height: 1080 },
  { id: 'a4', name: 'A4 Print', width: 1240, height: 1754 },
]

// =================== Rendering Styles ===================

export const RENDERING_STYLES = [
  'flat', 'nature', 'blueprint', 'ink-notes', 'minimalist-swiss', 'vector-illustration',
  'warm-scene', 'paper-cut', 'chalkboard', 'editorial', 'pixel-art', 'sketch-notes',
  'vintage-poster', 'watercolor', 'digital-dashboard', 'corporate-photo', '3d-isometric',
  'screen-print', 'glassmorphism', 'fantasy-animation',
] as const

// =================== Public API ===================

/** Get the design spec for a given style */
export function getDesignSpec(style: DesignStyle): DesignSpec {
  return STYLE_DESIGNS[style] || STYLE_DESIGNS.consulting
}

/** Get all built-in template presets */
export function getTemplatePresets(): TemplatePreset[] {
  return [...BUILTIN_TEMPLATES]
}

/** Get a specific template preset by ID */
export function getTemplatePreset(id: string): TemplatePreset | undefined {
  return BUILTIN_TEMPLATES.find(t => t.id === id)
}

/** Get all available color palettes */
export function getColorPalettes(): ColorPalette[] {
  return [...COLOR_PALETTES]
}

/** Get all canvas format options */
export function getCanvasFormats(): CanvasFormatInfo[] {
  return [...CANVAS_FORMATS]
}

/** Get canvas format info by ID */
export function getCanvasFormat(id: CanvasFormat): CanvasFormatInfo {
  return CANVAS_FORMATS.find(f => f.id === id) || CANVAS_FORMATS[0]
}

/** Get all available design styles with their colors */
export function getDesignStyles(): Array<{ id: DesignStyle; name: string; colors: string[] }> {
  return Object.entries(STYLE_DESIGNS).map(([id, spec]) => ({
    id: id as DesignStyle,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    colors: [spec.primaryColor, spec.secondaryColor, spec.accentColor],
  }))
}

/** Create a custom design spec by overriding a base style */
export function createCustomDesign(
  baseStyle: DesignStyle,
  overrides: Partial<DesignSpec>,
): DesignSpec {
  const base = getDesignSpec(baseStyle)
  return { ...base, ...overrides, style: overrides.style || base.style }
}
