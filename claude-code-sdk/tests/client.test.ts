import { ClaudeCodeClient } from '../src/client';
import { ClaudeCodeConfig } from '../src/types';
import { ValidationError, RateLimitError, AuthenticationError } from '../src/errors';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClaudeCodeClient', () => {
  let client: ClaudeCodeClient;
  const mockConfig: Required<ClaudeCodeConfig> = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.anthropic.com/v1',
    timeout: 30000,
    maxRetries: 3,
    debug: false,
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
  };

  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      post: jest.fn(),
      request: jest.fn(),
    } as any);

    client = new ClaudeCodeClient(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompletion', () => {
    it('should create a completion successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ text: 'Hello, world!' }],
          usage: {
            input_tokens: 10,
            output_tokens: 5,
          },
        },
      };

      (client as any).request = jest.fn().mockResolvedValue(mockResponse.data);

      const result = await client.createCompletion('Test prompt');

      expect(result).toEqual({
        content: 'Hello, world!',
        role: 'assistant',
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      });
    });

    it('should throw validation error for empty prompt', async () => {
      await expect(client.createCompletion('')).rejects.toThrow(ValidationError);
      await expect(client.createCompletion('   ')).rejects.toThrow(ValidationError);
    });

    it('should throw validation error for prompt exceeding max length', async () => {
      const longPrompt = 'a'.repeat(100001);
      await expect(client.createCompletion(longPrompt)).rejects.toThrow(ValidationError);
    });

    it('should include system prompt when provided', async () => {
      const mockRequest = jest.fn().mockResolvedValue({
        content: [{ text: 'Response' }],
      });
      (client as any).request = mockRequest;

      await client.createCompletion('Test prompt', {
        systemPrompt: 'You are a helpful assistant',
      });

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messages: [
              { role: 'system', content: 'You are a helpful assistant' },
              { role: 'user', content: 'Test prompt' },
            ],
          }),
        })
      );
    });
  });

  describe('session management', () => {
    it('should create a new session', async () => {
      const sessionId = await client.createSession({ projectName: 'test' });
      
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      
      const session = client.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.metadata?.projectName).toBe('test');
      expect(session?.messages).toEqual([]);
    });

    it('should continue an existing session', async () => {
      const sessionId = await client.createSession();
      
      const mockRequest = jest.fn().mockResolvedValue({
        content: [{ text: 'Response to prompt' }],
      });
      (client as any).request = mockRequest;

      const response = await client.continueSession(sessionId, 'New prompt');
      
      expect(response.content).toBe('Response to prompt');
      
      const session = client.getSession(sessionId);
      expect(session?.messages).toHaveLength(2);
      expect(session?.messages[0]).toEqual({
        role: 'user',
        content: 'New prompt',
      });
      expect(session?.messages[1]).toEqual({
        role: 'assistant',
        content: 'Response to prompt',
      });
    });

    it('should throw error when continuing non-existent session', async () => {
      await expect(
        client.continueSession('non-existent-id', 'Prompt')
      ).rejects.toThrow(ValidationError);
    });

    it('should list all sessions', async () => {
      await client.createSession({ name: 'session1' });
      await client.createSession({ name: 'session2' });
      
      const sessions = client.listSessions();
      
      expect(sessions).toHaveLength(2);
      expect(sessions[0].metadata?.name).toBe('session1');
      expect(sessions[1].metadata?.name).toBe('session2');
    });

    it('should clear a session', async () => {
      const sessionId = await client.createSession();
      
      expect(client.getSession(sessionId)).toBeDefined();
      
      const cleared = client.clearSession(sessionId);
      
      expect(cleared).toBe(true);
      expect(client.getSession(sessionId)).toBeUndefined();
    });
  });

  describe('executeWithTools', () => {
    it('should execute with tools and build correct system prompt', async () => {
      const mockRequest = jest.fn().mockResolvedValue({
        content: [{ text: 'Tool execution response' }],
      });
      (client as any).request = mockRequest;

      const tools = [
        {
          name: 'calculator',
          description: 'Performs calculations',
          parameters: { operation: 'string', numbers: 'array' },
        },
      ];

      const context = {
        workingDirectory: '/home/user',
        allowedOperations: ['read', 'write'] as any,
      };

      await client.executeWithTools('Calculate 2+2', tools, context);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                role: 'system',
                content: expect.stringContaining('Tool: calculator'),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should retry on rate limit error', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValueOnce(new RateLimitError('Rate limited', 1))
        .mockResolvedValueOnce({
          content: [{ text: 'Success after retry' }],
        });

      (client as any).request = mockRequest;
      (client as any).sleep = jest.fn().mockResolvedValue(undefined);

      const result = await (client as any).request({});

      expect(result.content[0].text).toBe('Success after retry');
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should not retry on authentication error', async () => {
      const mockRequest = jest.fn()
        .mockRejectedValue(new AuthenticationError('Invalid API key'));

      (client as any).request = mockRequest;

      await expect((client as any).request({})).rejects.toThrow(AuthenticationError);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });
  });
});