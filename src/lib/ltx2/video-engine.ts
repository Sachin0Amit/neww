/**
 * LTX-2 - Video Generation Engine
 * AI-powered video generation from text prompts
 */

import { generateVideo, pollAsyncResult } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { BaseWorkspaceState } from '@/lib/types';

export interface VideoGenerationRequest {
  prompt: string;
  quality?: 'standard' | 'high';
  duration?: number;
}

export interface VideoGenerationResult {
  id: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface Ltx2WorkspaceState extends BaseWorkspaceState {
  toolId: 'ltx2';
}

/** Generate a video from a text prompt */
export async function generateVideoFromPrompt(
  request: VideoGenerationRequest,
): Promise<Result<VideoGenerationResult>> {
  const result = await generateVideo({
    prompt: request.prompt,
    quality: request.quality || 'standard',
  });

  if (isOk(result)) {
    const videoId = result.value.id || `vid-${Date.now()}`;

    // If async, poll for result
    if (result.value.status === 'processing' && result.value.id) {
      const pollResult = await pollAsyncResult({
        taskId: result.value.id,
        maxAttempts: 30,
        intervalMs: 5000,
      });

      return ok({
        id: videoId,
        prompt: request.prompt,
        status: isOk(pollResult) ? 'completed' : 'failed',
        videoUrl: isOk(pollResult) ? (pollResult.value as any).url : undefined,
      });
    }

    return ok({
      id: videoId,
      prompt: request.prompt,
      status: 'completed',
      videoUrl: (result.value as any).url,
    });
  }

  return ok({
    id: `vid-${Date.now()}`,
    prompt: request.prompt,
    status: 'failed',
  });
}
