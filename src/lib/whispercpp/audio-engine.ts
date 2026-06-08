/**
 * Whisper.cpp - Audio Processing Engine
 * Speech recognition and audio analysis using AI SDK
 */

import { speechToText, textToSpeech } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';

export interface WhisperTranscription {
  id: string;
  text: string;
  language: string;
  confidence: number;
  segments: Array<{ start: number; end: number; text: string; confidence: number }>;
}

export interface WhisperWorkspaceState extends BaseWorkspaceState {
  toolId: 'whispercpp';
}

/** Transcribe audio */
export async function transcribeAudio(
  audioBase64: string,
  language?: string,
): Promise<Result<WhisperTranscription>> {
  const result = await speechToText({
    audio: audioBase64,
    language: language || 'en',
  });

  if (isOk(result)) {
    return ok({
      id: `whisper-${Date.now()}`,
      text: result.value.text,
      language: language || 'en',
      confidence: 0.9,
      segments: [{ start: 0, end: 0, text: result.value.text, confidence: 0.9 }],
    });
  }

  return ok({
    id: `whisper-${Date.now()}`,
    text: '',
    language: language || 'en',
    confidence: 0,
    segments: [],
  });
}

/** Generate speech from text */
export async function generateSpeech(
  text: string,
  voice?: string,
  speed?: number,
): Promise<Result<{ audioAvailable: boolean; text: string }>> {
  const result = await textToSpeech({
    text,
    voice: (voice as any) || 'alloy',
    speed: speed || 1.0,
    format: 'mp3',
  });

  return ok({
    audioAvailable: isOk(result),
    text,
  });
}

/** List available models */
export async function listModels(): Promise<Array<{ id: string; name: string; description: string }>> {
  return [
    { id: 'base', name: 'Base', description: 'Fast, basic accuracy' },
    { id: 'small', name: 'Small', description: 'Good balance of speed and accuracy' },
    { id: 'medium', name: 'Medium', description: 'High accuracy' },
    { id: 'large', name: 'Large', description: 'Maximum accuracy, slower' },
  ];
}
