export interface ClaudeCodeConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ConversationOptions {
  messages?: Message[];
  systemPrompt?: string;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result?: any;
}

export interface CompletionResponse {
  content: string;
  role: 'assistant';
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}

export type SDKResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ErrorResponse;
};

export interface SessionState {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface FileOperation {
  type: 'read' | 'write' | 'edit' | 'delete';
  path: string;
  content?: string;
  oldContent?: string;
  newContent?: string;
}

export interface ExecutionContext {
  workingDirectory: string;
  environment?: Record<string, string>;
  tools?: Tool[];
  allowedOperations?: FileOperation['type'][];
}