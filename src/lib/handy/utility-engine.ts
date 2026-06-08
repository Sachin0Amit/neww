/**
 * Handy - Utility Tool Engine
 * AI-powered utility tools (text, code, conversion, etc.)
 */

import { chatCompletion, askAI } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';
import crypto from 'crypto';

export interface HandyTool {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface HandyResult {
  id: string;
  toolId: string;
  input: string;
  output: string;
  timestamp: string;
}

export interface HandyWorkspaceState extends BaseWorkspaceState {
  toolId: 'handy';
}

const AVAILABLE_TOOLS: HandyTool[] = [
  { id: 'text-summarizer', name: 'Text Summarizer', description: 'Summarize any text concisely', category: 'text' },
  { id: 'code-explainer', name: 'Code Explainer', description: 'Explain code in plain language', category: 'code' },
  { id: 'grammar-fixer', name: 'Grammar Fixer', description: 'Fix grammar and spelling errors', category: 'text' },
  { id: 'translator', name: 'Translator', description: 'Translate text between languages', category: 'text' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON', category: 'code' },
  { id: 'regex-generator', name: 'Regex Generator', description: 'Generate regex from description', category: 'code' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between units', category: 'utility' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between color formats', category: 'utility' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords', category: 'utility' },
  { id: 'text-diff', name: 'Text Diff', description: 'Compare two texts', category: 'text' },
];

/** List available tools */
export async function listTools(): Promise<HandyTool[]> {
  return AVAILABLE_TOOLS;
}

/** Execute a handy tool */
export async function executeTool(toolId: string, input: string, options?: Record<string, string>): Promise<Result<HandyResult>> {
  const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
  if (!tool) return ok({ id: `result-${Date.now()}`, toolId, input, output: 'Tool not found', timestamp: new Date().toISOString() });

  const prompts: Record<string, string> = {
    'text-summarizer': `Summarize this text concisely:\n\n${input}`,
    'code-explainer': `Explain this code in plain language:\n\n${input}`,
    'grammar-fixer': `Fix grammar and spelling errors in this text. Return only the corrected version:\n\n${input}`,
    'translator': `Translate this text to ${options?.language || 'Spanish'}:\n\n${input}`,
    'json-formatter': `Format and validate this JSON. Return only the formatted JSON:\n\n${input}`,
    'regex-generator': `Generate a regex pattern for: ${input}\n\nReturn the regex pattern and a brief explanation.`,
    'unit-converter': `Convert: ${input}\n\nProvide the conversion result with steps.`,
    'color-converter': `Convert this color: ${input}\n\nProvide HEX, RGB, HSL formats.`,
    'password-generator': `Generate a secure password with these requirements: ${input || '16 characters, mixed case, numbers, symbols'}`,
    'text-diff': `Compare these two texts and highlight differences:\n\n${input}`,
  };

  const result = await askAI(
    prompts[toolId] || `Process this input:\n\n${input}`,
    'You are a helpful utility assistant. Be concise and accurate.',
    'small',
  );

  return ok({
    id: `result-${crypto.randomUUID().slice(0, 8)}`,
    toolId,
    input,
    output: isOk(result) ? result.value.text : 'Processing failed',
    timestamp: new Date().toISOString(),
  });
}
