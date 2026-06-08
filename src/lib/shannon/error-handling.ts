/**
 * Shannon - Error Handling
 * Adapted from the original Shannon codebase (AGPL-3.0)
 */

import { ErrorCode, type PentestErrorType, type PentestErrorContext } from './types';

export class PentestError extends Error {
  override name = 'PentestError' as const;
  type: PentestErrorType;
  retryable: boolean;
  context: PentestErrorContext;
  timestamp: string;
  code?: ErrorCode;

  constructor(
    message: string,
    type: PentestErrorType,
    retryable: boolean = false,
    context: PentestErrorContext = {},
    code?: ErrorCode,
  ) {
    super(message);
    this.type = type;
    this.retryable = retryable;
    this.context = context;
    this.timestamp = new Date().toISOString();
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export function handlePromptError(promptName: string, error: Error) {
  return new PentestError(
    `Failed to load prompt '${promptName}': ${error.message}`,
    'prompt',
    false,
    { promptName, originalError: error.message },
    ErrorCode.PROMPT_LOAD_FAILED,
  );
}

const RETRYABLE_PATTERNS = [
  'network', 'connection', 'timeout', 'econnreset', 'enotfound', 'econnrefused',
  'rate limit', '429', 'too many requests',
  'server error', '5xx', 'internal server error', 'service unavailable', 'bad gateway',
  'model unavailable', 'service temporarily unavailable', 'api error', 'terminated',
  'max turns', 'maximum turns',
];

const NON_RETRYABLE_PATTERNS = [
  'authentication', 'invalid prompt', 'out of memory', 'permission denied',
  'session limit reached', 'invalid api key',
];

export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  if (NON_RETRYABLE_PATTERNS.some(p => message.includes(p))) return false;
  return RETRYABLE_PATTERNS.some(p => message.includes(p));
}

export function classifyError(error: unknown): { type: string; retryable: boolean } {
  if (error instanceof PentestError && error.code !== undefined) {
    switch (error.code) {
      case ErrorCode.SPENDING_CAP_REACHED:
      case ErrorCode.INSUFFICIENT_CREDITS:
        return { type: 'BillingError', retryable: true };
      case ErrorCode.API_RATE_LIMITED:
        return { type: 'RateLimitError', retryable: true };
      case ErrorCode.CONFIG_NOT_FOUND:
      case ErrorCode.CONFIG_VALIDATION_FAILED:
      case ErrorCode.CONFIG_PARSE_ERROR:
      case ErrorCode.PROMPT_LOAD_FAILED:
        return { type: 'ConfigurationError', retryable: false };
      case ErrorCode.GIT_CHECKPOINT_FAILED:
      case ErrorCode.GIT_ROLLBACK_FAILED:
        return { type: 'GitError', retryable: false };
      case ErrorCode.OUTPUT_VALIDATION_FAILED:
      case ErrorCode.DELIVERABLE_NOT_FOUND:
        return { type: 'OutputValidationError', retryable: true };
      case ErrorCode.AGENT_EXECUTION_FAILED:
        return { type: 'AgentExecutionError', retryable: error.retryable };
      case ErrorCode.REPO_NOT_FOUND:
        return { type: 'ConfigurationError', retryable: false };
      case ErrorCode.AUTH_FAILED:
      case ErrorCode.AUTH_LOGIN_FAILED:
        return { type: 'AuthenticationError', retryable: false };
      case ErrorCode.BILLING_ERROR:
        return { type: 'BillingError', retryable: true };
      default:
        return { type: 'UnknownError', retryable: error.retryable };
    }
  }

  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Billing
  if (message.includes('billing') || message.includes('spending cap') || message.includes('insufficient')) {
    return { type: 'BillingError', retryable: true };
  }
  // Auth
  if (message.includes('authentication') || message.includes('api key') || message.includes('401')) {
    return { type: 'AuthenticationError', retryable: false };
  }
  // Permission
  if (message.includes('permission') || message.includes('forbidden') || message.includes('403')) {
    return { type: 'PermissionError', retryable: false };
  }
  // Output validation
  if (message.includes('failed output validation') || message.includes('output validation failed')) {
    return { type: 'OutputValidationError', retryable: true };
  }
  // Invalid request
  if (message.includes('invalid_request_error') || message.includes('malformed') || message.includes('validation')) {
    return { type: 'InvalidRequestError', retryable: false };
  }
  // Config
  if (message.includes('enoent') || message.includes('no such file')) {
    return { type: 'ConfigurationError', retryable: false };
  }

  return { type: 'TransientError', retryable: true };
}
