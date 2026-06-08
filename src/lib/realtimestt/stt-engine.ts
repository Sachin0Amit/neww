/**
 * RealtimeSTT - Speech-to-Text Processing Engine
 * AI-powered audio transcription
 */

import { speechToText } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';

export interface TranscriptionResult {
  id: string;
  text: string;
  language: string;
  duration: number;
  confidence: number;
  segments: Array<{ start: number; end: number; text: string }>;
}

export interface RealtimeSttWorkspaceState extends BaseWorkspaceState {
  toolId: 'realtimestt';
}

/** Transcribe audio from base64 data */
export async function transcribeAudio(
  audioBase64: string,
  language?: string,
): Promise<Result<TranscriptionResult>> {
  const result = await speechToText({
    audio: audioBase64,
    language: language || 'en',
  });

  if (isOk(result)) {
    const text = result.value.text;
    return ok({
      id: `stt-${Date.now()}`,
      text,
      language: language || 'en',
      duration: 0,
      confidence: 0.9,
      segments: [{ start: 0, end: 0, text }],
    });
  }

  return ok({
    id: `stt-${Date.now()}`,
    text: '',
    language: language || 'en',
    duration: 0,
    confidence: 0,
    segments: [],
  });
}

/** List supported languages */
export async function listLanguages(): Promise<Array<{ code: string; name: string }>> {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
  ];
}
