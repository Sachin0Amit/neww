/**
 * Cosmic Toolkit - Centralized AI SDK Wrapper
 *
 * Singleton manager and type-safe wrappers around z-ai-web-dev-sdk.
 * All tools must use this module for AI capabilities — never import the SDK directly.
 *
 * Features:
 * - Singleton ZAI instance management (lazy init, auto-reconnect)
 * - Chat completion (with optional streaming)
 * - Vision / VLM (image understanding)
 * - Web search & page reader
 * - Image generation
 * - TTS (text-to-speech) & ASR (speech-to-text)
 * - Video generation (async polling)
 * - Automatic retries with exponential backoff
 * - Token usage tracking
 * - Structured error handling via ToolError
 */

import ZAI from 'z-ai-web-dev-sdk';
import {
  type Result,
  type ToolError,
  type ModelTier,
  type ChatMessage,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type WebSearchRequest,
  type WebSearchResult,
  type ImageSearchRequest,
  type ImageSearchResultItem,
  type VisionContentItem,
  type VisionMessage,
  type VisionCompletionRequest,
  type ImageGenerationRequest,
  type ImageSize,
  type TTSRequest,
  type ASRRequest,
  type ASRResponse,
  type VideoGenerationRequest,
  type VideoGenerationResponse,
  type AsyncResultResponse,
  type PageReaderRequest,
  type PageReaderResponse,
  type TokenUsage,
  ok,
  err,
  isOk,
  createToolError,
  createTokenUsage,
  mergeTokenUsage,
} from './types';

// =================== Singleton Instance ===================

let _zaiInstance: ZAI | null = null;
let _initPromise: Promise<ZAI> | null = null;

/** Get or create the singleton ZAI instance */
export async function getZAI(): Promise<ZAI> {
  if (_zaiInstance) return _zaiInstance;

  // Deduplicate concurrent initialization attempts
  if (_initPromise) return _initPromise;

  _initPromise = ZAI.create().then((instance) => {
    _zaiInstance = instance;
    _initPromise = null;
    return instance;
  }).catch((error) => {
    _initPromise = null;
    throw error;
  });

  return _initPromise;
}

/** Reset the singleton (useful for testing or after auth changes) */
export function resetZAI(): void {
  _zaiInstance = null;
  _initPromise = null;
}

// =================== Model Resolution ===================

const DEFAULT_MODELS: Readonly<Record<ModelTier, string>> = {
  small: 'glm-4-flash',
  medium: 'glm-4-plus',
  large: 'glm-4-plus',
};

/** Resolve a model tier to a concrete model ID */
export function resolveModel(tier: ModelTier = 'medium'): string {
  switch (tier) {
    case 'small':
      return process.env.AI_SMALL_MODEL || DEFAULT_MODELS.small;
    case 'large':
      return process.env.AI_LARGE_MODEL || DEFAULT_MODELS.large;
    default:
      return process.env.AI_MEDIUM_MODEL || DEFAULT_MODELS.medium;
  }
}

/** Display name for a model ID */
export function getModelDisplayName(modelId: string): string {
  const names: Record<string, string> = {
    'glm-4-flash': 'GLM-4 Flash',
    'glm-4-plus': 'GLM-4 Plus',
    'claude-opus-4-7': 'Claude Opus 4.7',
    'claude-sonnet-4-6': 'Claude Sonnet 4.6',
    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  };
  return names[modelId] || modelId;
}

// =================== Cost Estimation ===================

const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  'glm-4-flash': { input: 0.000001, output: 0.000002 },
  'glm-4-plus': { input: 0.000003, output: 0.000006 },
  'claude-opus-4-7': { input: 0.000015, output: 0.000075 },
  'claude-sonnet-4-6': { input: 0.000003, output: 0.000015 },
  'claude-haiku-4-5-20251001': { input: 0.0000008, output: 0.000004 },
};

/** Estimate cost in USD for a given model and token counts */
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = COST_PER_TOKEN[model] || COST_PER_TOKEN['glm-4-plus'];
  return inputTokens * costs.input + outputTokens * costs.output;
}

// =================== Retry Logic ===================

const RETRYABLE_PATTERNS = [
  'network', 'connection', 'timeout', 'econnreset', 'enotfound', 'econnrefused',
  'rate limit', '429', 'too many requests',
  'server error', '5xx', 'internal server error', 'service unavailable', 'bad gateway',
  'model unavailable', 'service temporarily unavailable', 'api error', 'terminated',
];

const NON_RETRYABLE_PATTERNS = [
  'authentication', 'invalid prompt', 'out of memory', 'permission denied',
  'session limit reached', 'invalid api key', 'forbidden', '403', '401',
];

/** Determine if an error is retryable based on message patterns */
export function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error).toLowerCase();
  const lower = message.toLowerCase();
  if (NON_RETRYABLE_PATTERNS.some(p => lower.includes(p))) return false;
  return RETRYABLE_PATTERNS.some(p => lower.includes(p));
}

/** Classify an error into a ToolErrorType */
export function classifyError(error: unknown): ToolError {
  if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
    return error as ToolError;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  let type: ToolError['type'] = 'unknown';
  let retryable = false;

  if (lower.includes('authentication') || lower.includes('api key') || lower.includes('401')) {
    type = 'permission'; retryable = false;
  } else if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('403')) {
    type = 'permission'; retryable = false;
  } else if (lower.includes('billing') || lower.includes('spending cap') || lower.includes('insufficient')) {
    type = 'billing'; retryable = true;
  } else if (lower.includes('rate limit') || lower.includes('429')) {
    type = 'ai'; retryable = true;
  } else if (lower.includes('timeout') || lower.includes('timed out')) {
    type = 'timeout'; retryable = true;
  } else if (lower.includes('enoent') || lower.includes('no such file')) {
    type = 'filesystem'; retryable = false;
  } else if (lower.includes('validation') || lower.includes('invalid')) {
    type = 'validation'; retryable = false;
  } else if (isRetryableError(error)) {
    type = 'network'; retryable = true;
  }

  return createToolError(message, type, {
    retryable,
    cause: error instanceof Error ? error : undefined,
  });
}

/** Execute a function with automatic retries and exponential backoff */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
    onRetry?: (attempt: number, error: unknown) => void;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 1000;
  const maxDelayMs = options?.maxDelayMs ?? 30000;
  const shouldRetry = options?.shouldRetry ?? isRetryableError;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
        maxDelayMs,
      );

      options?.onRetry?.(attempt + 1, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// =================== Chat Completion ===================

/** Perform a chat completion using the ZAI SDK */
export async function chatCompletion(
  request: ChatCompletionRequest,
): Promise<Result<ChatCompletionResponse>> {
  return withRetry(async () => {
    const zai = await getZAI();
    const model = request.model || resolveModel('medium');

    const response = await zai.chat.completions.create({
      model,
      messages: request.messages,
      stream: false,
      thinking: { type: request.thinking || 'disabled' },
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.maxTokens !== undefined ? { max_tokens: request.maxTokens } : {}),
    });

    const text = response.choices?.[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || estimateInputTokens(request.messages);
    const outputTokens = response.usage?.completion_tokens || Math.ceil(text.length / 4);

    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
      apiCalls: 1,
    };

    const thinkingContent = response.choices?.[0]?.message?.thinking_content;

    return ok<ChatCompletionResponse>({
      text,
      usage,
      model,
      thinkingEnabled: request.thinking === 'enabled',
      thinkingContent,
    });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

/**
 * Streaming chat completion.
 * Returns an async generator that yields chunks of text as they arrive.
 */
export async function* chatCompletionStream(
  request: ChatCompletionRequest,
): AsyncGenerator<string, void, undefined> {
  const zai = await getZAI();
  const model = request.model || resolveModel('medium');

  const response = await zai.chat.completions.create({
    model,
    messages: request.messages,
    stream: true,
    thinking: { type: request.thinking || 'disabled' },
    ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
    ...(request.maxTokens !== undefined ? { max_tokens: request.maxTokens } : {}),
  });

  // The SDK returns a ReadableStream when stream: true
  if (response && typeof response === 'object' && 'getReader' in response) {
    const reader = (response as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    // Fallback: if streaming not supported, return full text
    const text = response?.choices?.[0]?.message?.content || '';
    if (text) yield text;
  }
}

// =================== Vision / VLM ===================

/** Perform a vision (image understanding) completion */
export async function visionCompletion(
  request: VisionCompletionRequest,
): Promise<Result<ChatCompletionResponse>> {
  return withRetry(async () => {
    const zai = await getZAI();
    const model = request.model || resolveModel('medium');

    const response = await zai.chat.completions.createVision({
      model,
      messages: request.messages,
      stream: false,
      thinking: { type: request.thinking || 'disabled' },
    });

    const text = response.choices?.[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || Math.ceil(text.length / 4);

    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
      apiCalls: 1,
    };

    return ok<ChatCompletionResponse>({
      text,
      usage,
      model,
      thinkingEnabled: request.thinking === 'enabled',
    });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

/** Convenience: analyze an image URL with a text prompt */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  options?: { model?: string; thinking?: 'enabled' | 'disabled' },
): Promise<Result<ChatCompletionResponse>> {
  const messages: VisionMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'image_url', imageUrl: { url: imageUrl } },
        { type: 'text', text: prompt },
      ],
    },
  ];

  return visionCompletion({ messages, ...options });
}

// =================== Web Search ===================

/** Perform a web search */
export async function webSearch(
  request: WebSearchRequest,
): Promise<Result<WebSearchResult[]>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const results = await zai.functions.invoke('web_search', {
      query: request.query,
      num: request.num ?? 10,
      ...(request.recencyDays ? { recency_days: request.recencyDays } : {}),
    });

    const mapped: WebSearchResult[] = (results || []).map((item: { url: string; name: string; snippet: string; host_name: string; rank: number; date: string; favicon: string }) => ({
      url: item.url,
      name: item.name,
      snippet: item.snippet,
      hostName: item.host_name,
      rank: item.rank,
      date: item.date,
      favicon: item.favicon,
    }));

    return ok(mapped);
  }).catch((error) => {
    return err(classifyError(error));
  });
}

/** Read a web page using the page_reader function */
export async function readWebPage(
  request: PageReaderRequest,
): Promise<Result<PageReaderResponse>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const result = await zai.functions.invoke('page_reader', {
      url: request.url,
    });

    return ok(result as PageReaderResponse);
  }).catch((error) => {
    return err(classifyError(error));
  });
}

// =================== Image Search ===================

/** Search for images */
export async function imageSearch(
  request: ImageSearchRequest,
): Promise<Result<ImageSearchResultItem[]>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const response = await zai.images.search.create({
      query: request.query,
      count: request.count ?? 10,
      ...(request.gl ? { gl: request.gl } : {}),
      ...(request.rank !== undefined ? { rank: request.rank } : {}),
    });

    const mapped: ImageSearchResultItem[] = (response.results || []).map((item: { original_url: string; caption?: string; source?: string; original_width?: string; original_height?: string }) => ({
      originalUrl: item.original_url,
      caption: item.caption,
      source: item.source,
      originalWidth: item.original_width,
      originalHeight: item.original_height,
    }));

    return ok(mapped);
  }).catch((error) => {
    return err(classifyError(error));
  });
}

// =================== Image Generation ===================

/** Generate an image from a text prompt */
export async function generateImage(
  request: ImageGenerationRequest,
): Promise<Result<{ base64: string; created: number }>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const response = await zai.images.generations.create({
      prompt: request.prompt,
      size: request.size || '1024x1024',
      ...(request.model ? { model: request.model } : {}),
    });

    const base64 = response.data?.[0]?.base64;
    if (!base64) {
      return err(createToolError('Image generation returned no data', 'ai', { retryable: true }));
    }

    return ok({ base64, created: response.created });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

/** Edit an image with a text prompt */
export async function editImage(
  prompt: string,
  imageBase64: string,
  size?: ImageSize,
): Promise<Result<{ base64: string; created: number }>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const response = await zai.images.generations.edit({
      prompt,
      image: imageBase64,
      ...(size ? { size } : {}),
    });

    const base64 = response.data?.[0]?.base64;
    if (!base64) {
      return err(createToolError('Image edit returned no data', 'ai', { retryable: true }));
    }

    return ok({ base64, created: response.created });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

// =================== TTS ===================

/** Generate speech from text */
export async function textToSpeech(
  request: TTSRequest,
): Promise<Result<{ audioData: unknown }>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const result = await zai.audio.tts.create({
      input: request.input,
      voice: request.voice || 'alloy',
      speed: request.speed || 1.0,
      response_format: request.responseFormat || 'mp3',
      stream: request.stream || false,
    });

    return ok({ audioData: result });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

// =================== ASR ===================

/** Transcribe audio to text */
export async function speechToText(
  request: ASRRequest,
): Promise<Result<ASRResponse>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const result = await zai.audio.asr.create({
      file_base64: request.fileBase64,
      ...(request.model ? { model: request.model } : {}),
    });

    const text = result?.text || (typeof result === 'string' ? result : JSON.stringify(result));
    return ok<ASRResponse>({ text });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

// =================== Video Generation ===================

/** Generate a video from a prompt or image */
export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<Result<VideoGenerationResponse>> {
  return withRetry(async () => {
    const zai = await getZAI();

    const response = await zai.video.generations.create({
      ...(request.prompt ? { prompt: request.prompt } : {}),
      ...(request.imageUrl ? { image_url: request.imageUrl } : {}),
      quality: request.quality || 'quality',
      with_audio: request.withAudio ?? false,
      watermark_enabled: request.watermarkEnabled ?? false,
      ...(request.size ? { size: request.size } : {}),
      ...(request.fps ? { fps: request.fps } : {}),
      ...(request.duration ? { duration: request.duration } : {}),
    });

    return ok<VideoGenerationResponse>({
      taskId: response.id,
      status: response.task_status,
    });
  }).catch((error) => {
    return err(classifyError(error));
  });
}

/** Poll for an async video/image generation result */
export async function pollAsyncResult(
  taskId: string,
  options?: {
    intervalMs?: number;
    maxAttempts?: number;
    onProgress?: (attempt: number, status: string) => void;
  },
): Promise<Result<AsyncResultResponse>> {
  const intervalMs = options?.intervalMs ?? 5000;
  const maxAttempts = options?.maxAttempts ?? 60;
  const onProgress = options?.onProgress;

  try {
    const zai = await getZAI();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await zai.async.result.query(taskId);

      onProgress?.(attempt, result.task_status);

      if (result.task_status === 'SUCCESS') {
        const response: AsyncResultResponse = {
          status: 'SUCCESS',
          results: result.video_result || result.url ? undefined : undefined,
          url: result.url || result.video_url || result.video,
        };

        // Extract video/image URLs from result
        if (result.video_result) {
          response.results = result.video_result.map((r: Record<string, unknown>) => ({ url: r.url as string }));
        }
        if (result.url) response.url = result.url;
        if (result.video_url) response.url = result.video_url;
        if (result.video) response.url = result.video;

        return ok(response);
      }

      if (result.task_status === 'FAIL') {
        return err(createToolError('Async task failed', 'ai', {
          retryable: false,
          context: { taskId, taskStatus: result.task_status },
        }));
      }

      // Still processing — wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return err(createToolError('Async task polling timed out', 'timeout', {
      retryable: true,
      context: { taskId, maxAttempts },
    }));
  } catch (error) {
    return err(classifyError(error));
  }
}

// =================== Utility ===================

/** Rough token estimation for input messages */
function estimateInputTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
}

/** Convenience: single-shot chat with a simple prompt */
export async function askAI(
  prompt: string,
  systemPrompt?: string,
  tier: ModelTier = 'medium',
): Promise<Result<ChatCompletionResponse>> {
  const messages: ChatMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    { role: 'user', content: prompt },
  ];

  return chatCompletion({ messages, model: resolveModel(tier) });
}

/** Convenience: single-shot vision analysis */
export async function askVision(
  imageUrl: string,
  prompt: string,
  systemPrompt?: string,
  tier: ModelTier = 'medium',
): Promise<Result<ChatCompletionResponse>> {
  const content: VisionContentItem[] = [
    { type: 'image_url', imageUrl: { url: imageUrl } },
    { type: 'text', text: prompt },
  ];

  const messages: VisionMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    { role: 'user', content },
  ];

  return visionCompletion({ messages, model: resolveModel(tier) });
}

// =================== Accumulated Usage Tracking ===================

/** Global token usage accumulator for the current process */
const _globalUsage: TokenUsage = createTokenUsage();

/** Add token usage to the global accumulator */
export function trackTokenUsage(usage: TokenUsage): void {
  _globalUsage.inputTokens += usage.inputTokens;
  _globalUsage.outputTokens += usage.outputTokens;
  _globalUsage.estimatedCostUsd += usage.estimatedCostUsd;
  _globalUsage.apiCalls += usage.apiCalls;
}

/** Get the current global token usage (read-only copy) */
export function getGlobalTokenUsage(): TokenUsage {
  return { ..._globalUsage };
}

/** Reset the global token usage accumulator */
export function resetGlobalTokenUsage(): void {
  _globalUsage.inputTokens = 0;
  _globalUsage.outputTokens = 0;
  _globalUsage.estimatedCostUsd = 0;
  _globalUsage.apiCalls = 0;
}
