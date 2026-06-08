/**
 * PPT Master - Generation Engine
 * 7-step AI-powered presentation generation pipeline
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { chatCompletion, askAI } from '@/lib/ai-sdk';
import { ok, err, isOk, isErr, createTokenUsage, mergeTokenUsage, type Result } from '@/lib/types';
import { getDesignSpec, getTemplatePreset } from './template-system';
import type {
  GenerationConfig,
  PipelineContext,
  PipelineStep,
  TopicAnalysis,
  OutlineResult,
  ContentResult,
  VisualPlanResult,
  LayoutDesignResult,
  ImageGenResult,
  Presentation,
  Slide,
  DesignSpec,
  GenerateRequest,
} from './types';

const WORKSPACE_DIR = path.join('/home/z/my-project/workspaces', 'ppt-master');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function createPipelineStep(name: string): PipelineStep {
  return { name, status: 'pending' };
}

// =================== Step 1: Topic Analysis ===================

async function analyzeTopic(config: GenerationConfig): Promise<Result<TopicAnalysis>> {
  const prompt = config.sourceContent
    ? `Analyze this content for a presentation. Source material:\n\n${config.sourceContent.slice(0, 3000)}`
    : `Analyze this presentation topic: "${config.topic}"`;

  const result = await askAI(
    `${prompt}

Identify:
- Main topic (concise)
- Target audience
- Tone/style guidance
- 3-5 key themes/subtopics to cover
- Purpose of the presentation
- Suggested slide count range

Return ONLY valid JSON:
{
  "topic": "...",
  "audience": "...",
  "tone": "...",
  "keyTopics": ["...", "..."],
  "purpose": "...",
  "suggestedSlideCount": {"min": 8, "max": 15}
}`,
    'You are a presentation strategist. Return only valid JSON.',
    'medium',
  );

  if (isErr(result)) return err(result.error);

  try {
    const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(text) as TopicAnalysis;
    return ok(analysis);
  } catch {
    return ok({
      topic: config.topic,
      audience: 'General',
      tone: 'Professional',
      keyTopics: [config.topic],
      purpose: 'Inform',
      suggestedSlideCount: { min: 8, max: 12 },
    });
  }
}

// =================== Step 2: Outline Generation ===================

async function generateOutline(config: GenerationConfig, analysis: TopicAnalysis): Promise<Result<OutlineResult>> {
  const slideCount = config.slideCount || Math.min(analysis.suggestedSlideCount.max, 12);

  const result = await askAI(
    `Create a presentation outline for: "${analysis.topic}"
Audience: ${analysis.audience}
Tone: ${analysis.tone}
Key topics: ${analysis.keyTopics.join(', ')}
Purpose: ${analysis.purpose}
Number of slides: ${slideCount}

Create a compelling outline with a clear narrative arc. Each slide should have:
- Type (title, content, image, chart, comparison, timeline, quote, conclusion, section)
- Title
- 3-5 key points
- Layout hint
- Whether it needs an image or chart

Return ONLY valid JSON:
{
  "title": "...",
  "subtitle": "...",
  "narrativeArc": "...",
  "slides": [
    {"index": 0, "type": "title", "title": "...", "keyPoints": ["..."], "layoutHint": "title-slide", "needsImage": false, "needsChart": false}
  ]
}`,
    'You are a presentation designer. Create engaging outlines. Return only valid JSON.',
    'medium',
  );

  if (isErr(result)) return err(result.error);

  try {
    const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const outline = JSON.parse(text) as OutlineResult;
    return ok(outline);
  } catch {
    return ok({
      title: analysis.topic,
      subtitle: analysis.audience,
      narrativeArc: 'Introduction → Key Points → Conclusion',
      slides: [
        { index: 0, type: 'title', title: analysis.topic, keyPoints: [], layoutHint: 'title-slide', needsImage: false, needsChart: false },
        { index: 1, type: 'section', title: 'Overview', keyPoints: ['Key point 1', 'Key point 2'], layoutHint: 'section-divider', needsImage: false, needsChart: false },
        { index: 2, type: 'content', title: 'Key Insights', keyPoints: analysis.keyTopics, layoutHint: 'content-header', needsImage: false, needsChart: false },
        { index: 3, type: 'conclusion', title: 'Summary', keyPoints: ['Thank you'], layoutHint: 'summary', needsImage: false, needsChart: false },
      ],
    });
  }
}

// =================== Step 3: Content Generation ===================

async function generateContent(outline: OutlineResult): Promise<Result<ContentResult>> {
  const slides = outline.slides;

  const result = await askAI(
    `Generate full content for each slide in this presentation outline:

Title: ${outline.title}
Subtitle: ${outline.subtitle}

${slides.map(s => `Slide ${s.index} (${s.type}): ${s.title}\nKey points: ${s.keyPoints.join(', ')}`).join('\n\n')}

For each slide, provide:
- Full title
- Optional subtitle
- 3-5 bullet points (concise, impactful)
- Speaker notes (2-3 sentences for the presenter)
- Chart data if slide type is "chart" (type, title, categories, series with values)

Return ONLY valid JSON:
{
  "slides": [
    {
      "index": 0,
      "title": "...",
      "subtitle": "...",
      "content": ["bullet 1", "bullet 2", "bullet 3"],
      "notes": "Speaker notes here",
      "chartData": null
    }
  ]
}`,
    'You are a presentation content writer. Write clear, concise, impactful content. Return only valid JSON.',
    'medium',
  );

  if (isErr(result)) return err(result.error);

  try {
    const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const content = JSON.parse(text) as ContentResult;
    return ok(content);
  } catch {
    return ok({
      slides: slides.map(s => ({
        index: s.index,
        title: s.title,
        content: s.keyPoints,
        notes: `Presenter discusses ${s.title}`,
      })),
    });
  }
}

// =================== Step 4: Visual Planning ===================

async function planVisuals(outline: OutlineResult, config: GenerationConfig): Promise<Result<VisualPlanResult>> {
  const slides = outline.slides.map(s => ({
    index: s.index,
    hasImage: config.includeImages && s.needsImage,
    imagePrompt: s.needsImage ? `Professional presentation visual for "${s.title}" - ${config.style} style, clean, high quality` : undefined,
    hasChart: config.includeCharts && s.needsChart,
    isComparison: s.type === 'comparison',
    isTimeline: s.type === 'timeline',
    emphasis: s.needsChart ? 'data' : s.needsImage ? 'visual' : 'text' as const,
  }));

  return ok({
    slides,
    imageStyleGuidance: `${config.style} style, professional, clean design, presentation-quality`,
  });
}

// =================== Step 5: Layout Design ===================

async function designLayout(outline: OutlineResult, design: DesignSpec): Promise<Result<LayoutDesignResult>> {
  const slides = outline.slides.map(s => {
    const isTitle = s.type === 'title';
    const isChart = s.needsChart;
    const isImage = s.needsImage;

    return {
      index: s.index,
      layout: s.layoutHint as LayoutDesignResult['slides'][0]['layout'],
      backgroundColor: design.backgroundColor,
      titlePosition: isTitle ? { x: 0.1, y: 0.3, w: 0.8, h: 0.15 } : { x: 0.05, y: 0.05, w: 0.9, h: 0.1 },
      contentPosition: isChart
        ? { x: 0.05, y: 0.18, w: 0.9, h: 0.7 }
        : isImage
        ? { x: 0.05, y: 0.18, w: 0.55, h: 0.7 }
        : { x: 0.05, y: 0.18, w: 0.9, h: 0.7 },
      imagePosition: isImage ? { x: 0.6, y: 0.18, w: 0.35, h: 0.7 } : undefined,
      chartPosition: isChart ? { x: 0.1, y: 0.25, w: 0.8, h: 0.55 } : undefined,
    };
  });

  return ok({ slides });
}

// =================== Step 6: Image Generation ===================

async function generateImages(visuals: VisualPlanResult): Promise<Result<ImageGenResult>> {
  const { generateImage } = await import('@/lib/ai-sdk');

  const slides: ImageGenResult['slides'] = [];

  for (const visual of visuals.slides) {
    if (visual.hasImage && visual.imagePrompt) {
      try {
        const imgResult = await generateImage({
          prompt: visual.imagePrompt,
          size: '1024x1024',
        });

        if (isOk(imgResult)) {
          slides.push({
            index: visual.index,
            imageData: imgResult.value.imageBase64,
            imagePrompt: visual.imagePrompt,
            success: true,
          });
        } else {
          slides.push({ index: visual.index, success: false, error: 'Image generation failed' });
        }
      } catch (error) {
        slides.push({
          index: visual.index,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      slides.push({ index: visual.index, success: false });
    }
  }

  return ok({ slides });
}

// =================== Step 7: Assemble Presentation ===================

function assemblePresentation(
  config: GenerationConfig,
  outline: OutlineResult,
  content: ContentResult,
  layout: LayoutDesignResult,
  images: ImageGenResult,
  design: DesignSpec,
): Presentation {
  const contentMap = new Map(content.slides.map(s => [s.index, s]));
  const layoutMap = new Map(layout.slides.map(s => [s.index, s]));
  const imageMap = new Map(images.slides.map(s => [s.index, s]));

  const slides: Slide[] = outline.slides.map((outlineSlide, i) => {
    const contentSlide = contentMap.get(outlineSlide.index);
    const layoutSlide = layoutMap.get(outlineSlide.index);
    const imageSlide = imageMap.get(outlineSlide.index);

    return {
      id: `slide-${i}`,
      type: outlineSlide.type as Slide['type'],
      title: contentSlide?.title || outlineSlide.title,
      subtitle: contentSlide?.subtitle,
      content: contentSlide?.content || outlineSlide.keyPoints,
      notes: contentSlide?.notes || '',
      layout: (layoutSlide?.layout || outlineSlide.layoutHint) as Slide['layout'],
      chart: contentSlide?.chartData as Slide['chart'],
      imageData: imageSlide?.imageData,
      imagePrompt: imageSlide?.imagePrompt,
      backgroundColor: layoutSlide?.backgroundColor,
    };
  });

  return {
    id: `pres-${crypto.randomUUID().slice(0, 8)}`,
    title: outline.title,
    slides,
    design,
    author: config.author || 'PPT Master',
    canvasFormat: config.canvasFormat,
    language: config.language,
    createdAt: new Date().toISOString(),
  };
}

// =================== Main Pipeline ===================

/**
 * Run the full 7-step presentation generation pipeline.
 */
export async function runGenerationPipeline(
  request: GenerateRequest,
): Promise<Result<PipelineContext>> {
  const startTime = Date.now();

  // Build config
  const config: GenerationConfig = {
    topic: request.topic || request.sourceContent?.slice(0, 100) || 'Untitled Presentation',
    slideCount: request.slideCount || 10,
    style: request.style || 'consulting',
    language: request.language || 'en',
    includeImages: request.includeImages ?? false,
    includeCharts: request.includeCharts ?? true,
    canvasFormat: request.canvasFormat || 'ppt169',
    sourceContent: request.sourceContent,
    sourceType: request.sourceType,
    author: request.author,
    templateId: request.templateId,
  };

  const pipelineSteps: PipelineStep[] = [
    createPipelineStep('Topic Analysis'),
    createPipelineStep('Outline Generation'),
    createPipelineStep('Content Generation'),
    createPipelineStep('Visual Planning'),
    createPipelineStep('Layout Design'),
    createPipelineStep('Image Generation'),
    createPipelineStep('Assembly'),
  ];

  const tokenUsage = createTokenUsage();
  const workspaceName = `ppt-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

  const ctx: PipelineContext = {
    config,
    workspaceName,
    pipelineSteps,
    tokenUsage,
    totalDurationMs: 0,
  };

  // Get design spec
  const template = config.templateId ? getTemplatePreset(config.templateId) : null;
  const design = template?.design || getDesignSpec(config.style);

  // Step 1: Topic Analysis
  pipelineSteps[0].status = 'running';
  const analysisResult = await analyzeTopic(config);
  if (isErr(analysisResult)) {
    pipelineSteps[0].status = 'failed';
    pipelineSteps[0].error = analysisResult.error.message;
    return err(analysisResult.error);
  }
  ctx.analysis = analysisResult.value;
  pipelineSteps[0].status = 'completed';
  pipelineSteps[0].durationMs = Date.now() - startTime;

  // Step 2: Outline
  pipelineSteps[1].status = 'running';
  const outlineResult = await generateOutline(config, ctx.analysis);
  if (isErr(outlineResult)) {
    pipelineSteps[1].status = 'failed';
    pipelineSteps[1].error = outlineResult.error.message;
    return err(outlineResult.error);
  }
  ctx.outline = outlineResult.value;
  pipelineSteps[1].status = 'completed';

  // Step 3: Content
  pipelineSteps[2].status = 'running';
  const contentResult = await generateContent(ctx.outline);
  if (isErr(contentResult)) {
    pipelineSteps[2].status = 'failed';
    pipelineSteps[2].error = contentResult.error.message;
    return err(contentResult.error);
  }
  ctx.content = contentResult.value;
  pipelineSteps[2].status = 'completed';

  // Step 4: Visual Planning
  pipelineSteps[3].status = 'running';
  const visualsResult = await planVisuals(ctx.outline, config);
  if (isErr(visualsResult)) {
    pipelineSteps[3].status = 'failed';
    pipelineSteps[3].error = visualsResult.error.message;
    return err(visualsResult.error);
  }
  ctx.visuals = visualsResult.value;
  pipelineSteps[3].status = 'completed';

  // Step 5: Layout Design
  pipelineSteps[4].status = 'running';
  const layoutResult = await designLayout(ctx.outline, design);
  if (isErr(layoutResult)) {
    pipelineSteps[4].status = 'failed';
    pipelineSteps[4].error = layoutResult.error.message;
    return err(layoutResult.error);
  }
  ctx.layout = layoutResult.value;
  pipelineSteps[4].status = 'completed';

  // Step 6: Image Generation
  pipelineSteps[5].status = 'running';
  if (config.includeImages) {
    const imagesResult = await generateImages(ctx.visuals);
    ctx.images = isOk(imagesResult) ? imagesResult.value : { slides: [] };
  } else {
    ctx.images = { slides: ctx.outline.slides.map(s => ({ index: s.index, success: false })) };
  }
  pipelineSteps[5].status = 'completed';

  // Step 7: Assembly
  pipelineSteps[6].status = 'running';
  ctx.presentation = assemblePresentation(
    config, ctx.outline, ctx.content, ctx.layout, ctx.images, design,
  );
  pipelineSteps[6].status = 'completed';

  // Save workspace
  ctx.totalDurationMs = Date.now() - startTime;
  try {
    const workspaceDir = path.join(WORKSPACE_DIR, workspaceName);
    await ensureDir(workspaceDir);
    await fs.writeFile(
      path.join(workspaceDir, 'context.json'),
      JSON.stringify(ctx, null, 2),
      'utf-8',
    );
  } catch {
    // Non-critical
  }

  return ok(ctx);
}

/** Load a workspace by name */
export async function loadWorkspace(workspaceName: string): Promise<PipelineContext | null> {
  try {
    const filePath = path.join(WORKSPACE_DIR, workspaceName, 'context.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as PipelineContext;
  } catch {
    return null;
  }
}

/** List all workspaces */
export async function listWorkspaces(): Promise<string[]> {
  try {
    await ensureDir(WORKSPACE_DIR);
    const entries = await fs.readdir(WORKSPACE_DIR, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }
}
