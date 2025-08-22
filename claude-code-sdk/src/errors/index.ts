export class ClaudeCodeError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ClaudeCodeError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ClaudeCodeError.prototype);
  }
}

export class AuthenticationError extends ClaudeCodeError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ClaudeCodeError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends ClaudeCodeError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ClaudeCodeError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends ClaudeCodeError {
  constructor(message: string, details?: any) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

export class ToolExecutionError extends ClaudeCodeError {
  public readonly toolName: string;

  constructor(message: string, toolName: string, details?: any) {
    super(message, 'TOOL_EXECUTION_ERROR', { toolName, ...details });
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
  }
}