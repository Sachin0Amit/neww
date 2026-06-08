/**
 * PDFCraft - Document Processing Engine
 * AI-powered PDF analysis, generation, and processing
 */

import { chatCompletion, askAI } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface DocumentAnalysis {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  wordCount: number;
  readingLevel: string;
  topics: string[];
}

export interface DocumentTransform {
  id: string;
  originalLength: number;
  transformedLength: number;
  type: string;
  result: string;
}

export interface PdfcraftWorkspaceState extends BaseWorkspaceState {
  toolId: 'pdfcraft';
}

/** Analyze a document's content */
export async function analyzeDocument(content: string): Promise<Result<DocumentAnalysis>> {
  const result = await askAI(
    `Analyze this document content:
${content.slice(0, 4000)}

Provide:
- Title/subject
- 2-3 sentence summary
- Key points (3-5)
- Named entities mentioned
- Overall sentiment
- Estimated reading level
- Main topics

Return ONLY valid JSON:
{
  "title":"...","summary":"...","keyPoints":["..."],"entities":["..."],
  "sentiment":"neutral","readingLevel":"...","topics":["..."]
}`,
    'You are a document analysis expert. Return only valid JSON.',
    'medium',
  );

  if (isOk(result)) {
    try {
      const text = result.value.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      return ok({
        id: `doc-${crypto.randomUUID().slice(0, 8)}`,
        wordCount: content.split(/\s+/).length,
        ...parsed,
      });
    } catch {}
  }

  return ok({
    id: `doc-${crypto.randomUUID().slice(0, 8)}`,
    title: 'Untitled',
    summary: 'Analysis could not be completed',
    keyPoints: [], entities: [], sentiment: 'neutral',
    wordCount: content.split(/\s+/).length, readingLevel: 'Unknown', topics: [],
  });
}

/** Transform a document (summarize, rewrite, translate, etc.) */
export async function transformDocument(
  content: string,
  transformType: 'summarize' | 'rewrite' | 'simplify' | 'expand' | 'translate',
  options?: { language?: string; style?: string },
): Promise<Result<DocumentTransform>> {
  const prompts: Record<string, string> = {
    summarize: `Summarize this document in a concise way, preserving key information:\n\n${content.slice(0, 4000)}`,
    rewrite: `Rewrite this document ${options?.style ? `in ${options.style} style` : 'more professionally'}:\n\n${content.slice(0, 4000)}`,
    simplify: `Simplify this document for a general audience while keeping key information:\n\n${content.slice(0, 4000)}`,
    expand: `Expand this document with more details, examples, and explanations:\n\n${content.slice(0, 4000)}`,
    translate: `Translate this document to ${options?.language || 'Spanish'}:\n\n${content.slice(0, 4000)}`,
  };

  const result = await chatCompletion({
    messages: [
      { role: 'system', content: 'You are a document transformation expert. Maintain accuracy while transforming.' },
      { role: 'user', content: prompts[transformType] || prompts.summarize },
    ],
    temperature: 0.7,
    maxTokens: 3000,
  });

  if (isOk(result)) {
    return ok({
      id: `transform-${crypto.randomUUID().slice(0, 8)}`,
      originalLength: content.length,
      transformedLength: result.value.text.length,
      type: transformType,
      result: result.value.text,
    });
  }

  return ok({
    id: `transform-${crypto.randomUUID().slice(0, 8)}`,
    originalLength: content.length,
    transformedLength: 0,
    type: transformType,
    result: 'Transformation failed',
  });
}
