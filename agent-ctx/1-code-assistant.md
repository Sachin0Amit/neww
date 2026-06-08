# Task 1 - Shared Backend Infrastructure

## Agent: Code Assistant
## Date: 2026-03-04

## Task Summary
Create the shared backend infrastructure for the Cosmic Toolkit project: three core modules that all tool backends will depend on.

## Files Created

### 1. `src/lib/types.ts` - Shared Type Definitions (~300 lines)
Complete type system used across all tools:
- `Result<T, E>` discriminated union with `ok`/`err`/`isOk`/`isErr`
- `ToolStatus` (idle/initializing/running/paused/completed/failed/cancelled) with helpers
- `Progress` step-based tracking with `createProgress()`
- `ToolError` with `ToolErrorType` classification (10 categories) and `createToolError()`
- `LogEntry` with `LogLevel` severity
- `BaseWorkspaceState` base interface (id, name, toolId, status, timestamps, progress, error, tokenUsage, metadata)
- `TokenUsage` with `createTokenUsage()`, `mergeTokenUsage()`
- `ApiResponse<T>` with `apiSuccess()`, `apiError()`
- Full AI SDK request/response types: ChatMessage, ChatCompletionRequest/Response, WebSearchRequest/Result, VisionMessage/ContentItem, ImageGenerationRequest/Response, TTSRequest, ASRRequest/Response, VideoGenerationRequest/Response, AsyncResultResponse, PageReaderRequest/Response

### 2. `src/lib/ai-sdk.ts` - Centralized AI SDK Wrapper (~580 lines)
Singleton wrapper around z-ai-web-dev-sdk:
- `getZAI()` singleton with dedup init, `resetZAI()`
- `resolveModel()` with env var overrides (AI_SMALL/MEDIUM/LARGE_MODEL)
- `estimateCost()` with per-model pricing table
- `isRetryableError()`, `classifyError()`, `withRetry()` (exponential backoff + jitter)
- `chatCompletion()` - full chat with Result return
- `chatCompletionStream()` - async generator for SSE streaming
- `visionCompletion()`, `analyzeImage()` - VLM helpers
- `webSearch()`, `readWebPage()` - web functions
- `imageSearch()` - image search
- `generateImage()`, `editImage()` - image generation
- `textToSpeech()`, `speechToText()` - audio
- `generateVideo()`, `pollAsyncResult()` - video with async polling
- `askAI()`, `askVision()` - convenience single-shot methods
- `trackTokenUsage()`, `getGlobalTokenUsage()`, `resetGlobalTokenUsage()` - global tracking

### 3. `src/lib/base-tool.ts` - Base Tool Class (~400 lines)
Abstract base class for all tool backends:
- `BaseTool<TState extends BaseWorkspaceState>` with `toolId`/`toolName` abstract props
- Workspace dir management: `/home/z/my-project/workspaces/{tool-id}/`
- State persistence: `initWorkspace()`, `readState()`, `writeState()` (atomic), `updateState()` (partial)
- Progress: `updateProgress()`, `markRunning()`, `markCompleted()`, `markFailed()`, `markCancelled()`
- JSONL logs: `appendLog()` (fire-and-forget), `readLogs()` with filters
- Token tracking: `addTokenUsage()`, `getTokenUsage()`
- Deliverables: `save/read/list/deleteDeliverable()`
- Workspace CRUD: `listWorkspaces()`, `deleteWorkspace()`, `getWorkspaceOrThrow()`
- Status: `getStatus()` with aggregate counts + token usage
- Utilities: `generateWorkspaceName()`, `writeWorkspaceFile()`, `readWorkspaceFile()`

## Key Design Decisions
1. **Result over exceptions**: Discriminated union `Result<T, ToolError>` for predictable error handling
2. **Type guard narrowing**: Used `isErr()` function for TypeScript generic discriminated union narrowing
3. **Atomic writes**: Temp file + rename to prevent state corruption
4. **Fire-and-forget logging**: `appendLog()` silently swallows errors to never break main workflow
5. **Generic base class**: `BaseTool<TState>` allows each tool to extend with custom fields
6. **Centralized SDK**: Single ZAI instance prevents duplicate initialization and ensures consistent model/cost config

## Verification
- TypeScript compiles with zero errors (project-wide, excluding unrelated repos/ files)
- Dev server running on port 3000 without errors
