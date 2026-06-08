/**
 * Cosmic Toolkit - Shared Type Definitions
 * Common types used across all tool backends in the Cosmic Toolkit project.
 */

// =================== Result Type ===================

/** A successful result wrapper */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/** A failed result wrapper */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/** Discriminated union result type for type-safe error handling */
export type Result<T, E = ToolError> = Ok<T> | Err<E>;

/** Create a success result */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Create a failure result */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard: check if result is successful */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/** Type guard: check if result is a failure */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

// =================== Tool Status ===================

/** Overall status of a tool operation or workspace */
export type ToolStatus =
  | 'idle'          // No active operation
  | 'initializing'  // Setting up
  | 'running'       // Actively processing
  | 'paused'        // Temporarily paused
  | 'completed'     // Successfully finished
  | 'failed'        // Ended with error
  | 'cancelled';    // User cancelled

/** Whether a status represents an active (non-terminal) state */
export function isActiveStatus(status: ToolStatus): boolean {
  return status === 'initializing' || status === 'running' || status === 'paused';
}

/** Whether a status represents a terminal state */
export function isTerminalStatus(status: ToolStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

// =================== Progress ===================

/** Progress information for a running operation */
export interface Progress {
  /** Current step/phase name */
  currentStep: string;
  /** Step index (0-based) */
  stepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Percentage 0-100 */
  percent: number;
  /** Optional detail message */
  message?: string;
  /** Timestamp of this progress update */
  timestamp: string;
}

/** Create an initial progress object */
export function createProgress(
  currentStep: string,
  stepIndex: number,
  totalSteps: number,
  message?: string,
): Progress {
  const percent = totalSteps > 0 ? Math.round((stepIndex / totalSteps) * 100) : 0;
  return {
    currentStep,
    stepIndex,
    totalSteps,
    percent: Math.min(percent, 100),
    message,
    timestamp: new Date().toISOString(),
  };
}

// =================== Tool Error ===================

/** Category of tool error */
export type ToolErrorType =
  | 'config'        // Configuration / validation error
  | 'network'       // Network / connection error
  | 'ai'            // AI/LLM API error
  | 'filesystem'    // File system error
  | 'validation'    // Input/output validation error
  | 'billing'       // Billing / credits error
  | 'permission'    // Permission / auth error
  | 'timeout'       // Operation timed out
  | 'cancelled'     // Operation was cancelled
  | 'unknown';      // Unclassified error

/** Standardized error structure for all tools */
export interface ToolError {
  /** Error type category */
  type: ToolErrorType;
  /** Human-readable error message */
  message: string;
  /** Whether the operation can be retried */
  retryable: boolean;
  /** Machine-readable error code */
  code?: string;
  /** Additional context for debugging */
  context?: Record<string, unknown>;
  /** ISO timestamp when error occurred */
  timestamp: string;
  /** Original error if wrapping a native Error */
  cause?: string;
}

/** Create a ToolError from various inputs */
export function createToolError(
  message: string,
  type: ToolErrorType = 'unknown',
  options?: {
    retryable?: boolean;
    code?: string;
    context?: Record<string, unknown>;
    cause?: Error | unknown;
  },
): ToolError {
  return {
    type,
    message,
    retryable: options?.retryable ?? false,
    code: options?.code,
    context: options?.context,
    timestamp: new Date().toISOString(),
    cause: options?.cause instanceof Error
      ? options.cause.message
      : options?.cause != null
        ? String(options.cause)
        : undefined,
  };
}

// =================== Log Entry ===================

/** Severity level for log entries */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** A structured log entry in JSONL format */
export interface LogEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Log severity */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Optional context/source identifier */
  context?: string;
  /** Optional structured data */
  data?: Record<string, unknown>;
}

// =================== Workspace State ===================

/** Base workspace state that all tools share */
export interface BaseWorkspaceState {
  /** Unique workspace ID */
  id: string;
  /** Human-readable workspace name */
  name: string;
  /** Tool identifier (e.g., 'shannon', 'dexter') */
  toolId: string;
  /** Current workspace status */
  status: ToolStatus;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Completion timestamp (if terminal) */
  completedAt?: string;
  /** Current progress */
  progress?: Progress;
  /** Last error (if failed) */
  error?: ToolError;
  /** Accumulated token usage for the workspace */
  tokenUsage?: TokenUsage;
  /** Arbitrary metadata specific to each tool */
  metadata?: Record<string, unknown>;
}

// =================== Token Usage ===================

/** Token usage tracking */
export interface TokenUsage {
  /** Total input tokens used */
  inputTokens: number;
  /** Total output tokens used */
  outputTokens: number;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Number of API calls made */
  apiCalls: number;
}

/** Create a zero token usage object */
export function createTokenUsage(): TokenUsage {
  return { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, apiCalls: 0 };
}

/** Merge token usage from multiple sources */
export function mergeTokenUsage(...usages: TokenUsage[]): TokenUsage {
  return usages.reduce(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      estimatedCostUsd: acc.estimatedCostUsd + u.estimatedCostUsd,
      apiCalls: acc.apiCalls + u.apiCalls,
    }),
    createTokenUsage(),
  );
}

// =================== API Request / Response ===================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  /** Whether the request succeeded */
  success: boolean;
  /** Response data (if success) */
  data?: T;
  /** Error info (if failed) */
  error?: ToolError;
  /** Request metadata */
  meta?: {
    /** Server processing time in ms */
    durationMs?: number;
    /** Request ID for tracing */
    requestId?: string;
  };
}

/** Create a successful API response */
export function apiSuccess<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return { success: true, data, meta };
}

/** Create a failed API response */
export function apiError(error: ToolError, meta?: ApiResponse['meta']): ApiResponse<never> {
  return { success: false, error, meta };
}

// =================== AI Model Types ===================

/** Model tier for LLM calls */
export type ModelTier = 'small' | 'medium' | 'large';

/** Image size presets */
export type ImageSize =
  | '1024x1024'
  | '768x1344'
  | '864x1152'
  | '1344x768'
  | '1152x864'
  | '1440x720'
  | '720x1440';

/** TTS voice options */
export type TTSVoice = string;

/** TTS audio format */
export type TTSAudioFormat = 'mp3' | 'wav' | 'pcm' | 'opus';

// =================== Chat Types ===================

/** Chat message role */
export type ChatRole = 'system' | 'user' | 'assistant';

/** A chat message */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Chat completion request */
export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  thinking?: 'enabled' | 'disabled';
  temperature?: number;
  maxTokens?: number;
}

/** Chat completion response */
export interface ChatCompletionResponse {
  /** The generated text */
  text: string;
  /** Token usage for this call */
  usage: TokenUsage;
  /** Model used for generation */
  model: string;
  /** Whether thinking was enabled */
  thinkingEnabled: boolean;
  /** Thinking content if enabled */
  thinkingContent?: string;
}

// =================== Search Types ===================

/** Web search request */
export interface WebSearchRequest {
  query: string;
  num?: number;
  recencyDays?: number;
}

/** A single web search result */
export interface WebSearchResult {
  url: string;
  name: string;
  snippet: string;
  hostName: string;
  rank: number;
  date: string;
  favicon: string;
}

/** Image search request */
export interface ImageSearchRequest {
  query: string;
  count?: number;
  gl?: string;
  rank?: boolean;
}

/** Image search result item */
export interface ImageSearchResultItem {
  originalUrl: string;
  caption?: string;
  source?: string;
  originalWidth?: string;
  originalHeight?: string;
}

// =================== Vision Types ===================

/** Vision multimodal content item */
export interface VisionContentItem {
  type: 'text' | 'image_url' | 'video_url' | 'file_url';
  text?: string;
  imageUrl?: { url: string };
  videoUrl?: { url: string };
  fileUrl?: { url: string };
}

/** Vision chat message */
export interface VisionMessage {
  role: ChatRole;
  content: string | VisionContentItem[];
}

/** Vision completion request */
export interface VisionCompletionRequest {
  messages: VisionMessage[];
  model?: string;
  stream?: boolean;
  thinking?: 'enabled' | 'disabled';
}

// =================== Image Generation Types ===================

/** Image generation request */
export interface ImageGenerationRequest {
  prompt: string;
  size?: ImageSize;
  model?: string;
}

/** Image generation response */
export interface ImageGenerationResponse {
  /** Base64 encoded image data */
  base64: string;
  /** Creation timestamp */
  created: number;
}

// =================== Audio Types ===================

/** TTS request */
export interface TTSRequest {
  input: string;
  voice?: TTSVoice;
  speed?: number;
  responseFormat?: TTSAudioFormat;
  stream?: boolean;
}

/** ASR request */
export interface ASRRequest {
  /** Base64 encoded audio file */
  fileBase64: string;
  model?: string;
}

/** ASR response */
export interface ASRResponse {
  /** Transcribed text */
  text: string;
}

// =================== Video Types ===================

/** Video generation request */
export interface VideoGenerationRequest {
  prompt?: string;
  imageUrl?: string | string[];
  quality?: 'speed' | 'quality';
  withAudio?: boolean;
  watermarkEnabled?: boolean;
  size?: string;
  fps?: number;
  duration?: number;
}

/** Video generation response */
export interface VideoGenerationResponse {
  /** Task ID for polling */
  taskId: string;
  /** Initial task status */
  status: 'PROCESSING' | 'SUCCESS' | 'FAIL';
}

/** Async result query response */
export interface AsyncResultResponse {
  status: 'PROCESSING' | 'SUCCESS' | 'FAIL';
  /** Video/image URLs when completed */
  results?: Array<{ url: string }>;
  /** Single URL result */
  url?: string;
}

// =================== Page Reader Types ===================

/** Page reader request */
export interface PageReaderRequest {
  url: string;
}

/** Page reader response */
export interface PageReaderResponse {
  code: number;
  data: {
    html: string;
    publishedTime?: string;
    title: string;
    url: string;
    usage: { tokens: number };
  };
  status: number;
}
