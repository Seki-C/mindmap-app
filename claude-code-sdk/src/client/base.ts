import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ClaudeCodeConfig } from '../types';
import {
  ClaudeCodeError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from '../errors';
import Logger from '../utils/logger';

export abstract class BaseClient {
  protected axiosInstance: AxiosInstance;
  protected config: Required<ClaudeCodeConfig>;
  protected logger: Logger;

  constructor(config: Required<ClaudeCodeConfig>) {
    this.config = config;
    this.logger = new Logger({
      level: config.debug ? 'debug' : 'info',
      silent: !config.debug,
    });

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response: ${response.status} ${response.statusText}`);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private async handleError(error: AxiosError): Promise<never> {
    this.logger.error('API Error:', error.message);

    if (error.code === 'ECONNABORTED') {
      throw new TimeoutError('Request timed out', { timeout: this.config.timeout });
    }

    if (!error.response) {
      throw new NetworkError('Network error occurred', { 
        message: error.message,
        code: error.code,
      });
    }

    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 401:
        throw new AuthenticationError('Invalid API key', data);
      case 429:
        const retryAfter = error.response.headers['retry-after'];
        throw new RateLimitError(
          'Rate limit exceeded',
          retryAfter ? parseInt(retryAfter as string, 10) : undefined
        );
      case 400:
        throw new ClaudeCodeError('Bad request', 'BAD_REQUEST', data);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ClaudeCodeError('Server error', 'SERVER_ERROR', data);
      default:
        throw new ClaudeCodeError(
          data?.error?.message || 'Unknown error',
          `HTTP_${status}`,
          data
        );
    }
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error | undefined;
    const maxRetries = this.config.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.axiosInstance.request<T>(config);
        return response.data;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        if (!this.shouldRetry(error as Error)) {
          throw error;
        }

        const delay = this.calculateBackoff(attempt, error as Error);
        this.logger.debug(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof RateLimitError) {
      return true;
    }

    if (error instanceof TimeoutError) {
      return true;
    }

    if (error instanceof ClaudeCodeError) {
      const retryableCodes = ['SERVER_ERROR', 'HTTP_502', 'HTTP_503', 'HTTP_504'];
      return retryableCodes.includes(error.code);
    }

    if (error instanceof NetworkError) {
      return true;
    }

    return false;
  }

  private calculateBackoff(attempt: number, error: Error): number {
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }

    const baseDelay = 1000;
    const maxDelay = 30000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    
    const jitter = Math.random() * 0.3 * exponentialDelay;
    
    return Math.floor(exponentialDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const commonHeaders = this.axiosInstance.defaults.headers.common as Record<string, string>;
    return {
      ...commonHeaders,
      ...additionalHeaders,
    };
  }
}