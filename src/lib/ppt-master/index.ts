/**
 * PPT Master - Barrel Export
 * AI-powered presentation generation
 */

export * from './types';
export { runGenerationPipeline, loadWorkspace, listWorkspaces } from './generation-engine';
export {
  getDesignSpec,
  getTemplatePresets,
  getTemplatePreset,
  getColorPalettes,
  getCanvasFormats,
  getCanvasFormat,
  getDesignStyles,
  createCustomDesign,
  RENDERING_STYLES,
} from './template-system';
export type { ColorPalette, CanvasFormatInfo } from './template-system';
