import { BaseClient } from './base';
import {
  ClaudeCodeConfig,
  Message,
  ConversationOptions,
  CompletionResponse,
  Tool,
  SessionState,
  ExecutionContext,
} from '../types';
import { ValidationError } from '../errors';
import { v4 as uuidv4 } from 'uuid';

export class ClaudeCodeClient extends BaseClient {
  private sessions: Map<string, SessionState> = new Map();

  constructor(config: Required<ClaudeCodeConfig>) {
    super(config);
  }

  async createCompletion(
    prompt: string,
    options?: ConversationOptions
  ): Promise<CompletionResponse> {
    this.validatePrompt(prompt);

    const messages: Message[] = options?.messages || [];
    messages.push({ role: 'user', content: prompt });

    if (options?.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const requestBody = {
      model: this.config.model,
      messages: this.formatMessages(messages),
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: options?.stream || false,
    };

    if (options?.stream) {
      return this.streamCompletion(requestBody, options.onChunk);
    }

    const response = await this.request<any>({
      method: 'POST',
      url: '/messages',
      data: requestBody,
    });

    return this.formatResponse(response);
  }

  async createSession(metadata?: Record<string, any>): Promise<string> {
    const sessionId = uuidv4();
    const session: SessionState = {
      id: sessionId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    };

    this.sessions.set(sessionId, session);
    
    this.logger.info(`Created new session: ${sessionId}`);
    return sessionId;
  }

  async continueSession(
    sessionId: string,
    prompt: string,
    options?: ConversationOptions
  ): Promise<CompletionResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new ValidationError(`Session ${sessionId} not found`);
    }

    const allMessages = [...session.messages];
    const optionsWithHistory: ConversationOptions = {
      ...options,
      messages: allMessages,
    };

    const response = await this.createCompletion(prompt, optionsWithHistory);

    session.messages.push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: response.content }
    );
    session.updatedAt = new Date();

    return response;
  }

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  listSessions(): SessionState[] {
    return Array.from(this.sessions.values());
  }

  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  async executeWithTools(
    prompt: string,
    tools: Tool[],
    context?: ExecutionContext
  ): Promise<CompletionResponse> {
    const systemPrompt = this.buildToolSystemPrompt(tools, context);
    
    const response = await this.createCompletion(prompt, {
      systemPrompt,
    });

    if (response.toolCalls && response.toolCalls.length > 0) {
      this.logger.debug(`Executing ${response.toolCalls.length} tool calls`);
    }

    return response;
  }

  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new ValidationError('Prompt cannot be empty');
    }

    if (prompt.length > 100000) {
      throw new ValidationError('Prompt exceeds maximum length of 100,000 characters');
    }
  }

  private formatMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private formatResponse(apiResponse: any): CompletionResponse {
    return {
      content: apiResponse.content[0].text,
      role: 'assistant',
      usage: apiResponse.usage ? {
        promptTokens: apiResponse.usage.input_tokens,
        completionTokens: apiResponse.usage.output_tokens,
        totalTokens: apiResponse.usage.input_tokens + apiResponse.usage.output_tokens,
      } : undefined,
    };
  }

  private async streamCompletion(
    requestBody: any,
    onChunk?: (chunk: string) => void
  ): Promise<CompletionResponse> {
    const response = await this.axiosInstance.post('/messages', requestBody, {
      responseType: 'stream',
    });

    let fullContent = '';
    
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta') {
                const delta = data.delta.text;
                fullContent += delta;
                if (onChunk) {
                  onChunk(delta);
                }
              }
            } catch (error) {
              this.logger.debug('Failed to parse stream chunk:', error);
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve({
          content: fullContent,
          role: 'assistant',
        });
      });

      response.data.on('error', reject);
    });
  }

  private buildToolSystemPrompt(tools: Tool[], context?: ExecutionContext): string {
    let prompt = 'You are an AI assistant with access to the following tools:\n\n';
    
    for (const tool of tools) {
      prompt += `Tool: ${tool.name}\n`;
      prompt += `Description: ${tool.description}\n`;
      if (tool.parameters) {
        prompt += `Parameters: ${JSON.stringify(tool.parameters, null, 2)}\n`;
      }
      prompt += '\n';
    }

    if (context) {
      prompt += '\nExecution Context:\n';
      prompt += `Working Directory: ${context.workingDirectory}\n`;
      if (context.allowedOperations) {
        prompt += `Allowed Operations: ${context.allowedOperations.join(', ')}\n`;
      }
    }

    prompt += '\nWhen you need to use a tool, respond with a JSON object in the following format:\n';
    prompt += '{"tool": "tool_name", "parameters": {...}}\n';

    return prompt;
  }
}

// Add uuid to dependencies
export { ClaudeCodeClient as default };