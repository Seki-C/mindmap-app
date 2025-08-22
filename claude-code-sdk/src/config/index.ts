import { ClaudeCodeConfig } from '../types';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const DEFAULT_CONFIG: Required<ClaudeCodeConfig> = {
  apiKey: '',
  baseUrl: 'https://api.anthropic.com/v1',
  timeout: 30000,
  maxRetries: 3,
  debug: false,
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 4096,
};

export class ConfigManager {
  private config: Required<ClaudeCodeConfig>;

  constructor(userConfig?: ClaudeCodeConfig) {
    this.config = this.loadConfig(userConfig);
    this.validateConfig();
  }

  private loadConfig(userConfig?: ClaudeCodeConfig): Required<ClaudeCodeConfig> {
    const envConfig = this.loadFromEnv();
    const fileConfig = this.loadFromFile();

    return {
      ...DEFAULT_CONFIG,
      ...fileConfig,
      ...envConfig,
      ...userConfig,
    };
  }

  private loadFromEnv(): Partial<ClaudeCodeConfig> {
    const config: Partial<ClaudeCodeConfig> = {};

    if (process.env.CLAUDE_API_KEY) {
      config.apiKey = process.env.CLAUDE_API_KEY;
    }

    if (process.env.CLAUDE_BASE_URL) {
      config.baseUrl = process.env.CLAUDE_BASE_URL;
    }

    if (process.env.CLAUDE_TIMEOUT) {
      config.timeout = parseInt(process.env.CLAUDE_TIMEOUT, 10);
    }

    if (process.env.CLAUDE_MAX_RETRIES) {
      config.maxRetries = parseInt(process.env.CLAUDE_MAX_RETRIES, 10);
    }

    if (process.env.CLAUDE_DEBUG === 'true') {
      config.debug = true;
    }

    if (process.env.CLAUDE_MODEL) {
      config.model = process.env.CLAUDE_MODEL;
    }

    if (process.env.CLAUDE_TEMPERATURE) {
      config.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE);
    }

    if (process.env.CLAUDE_MAX_TOKENS) {
      config.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS, 10);
    }

    return config;
  }

  private loadFromFile(): Partial<ClaudeCodeConfig> {
    const configPaths = [
      path.join(process.cwd(), '.claude-code.json'),
      path.join(process.cwd(), 'claude-code.config.json'),
      path.join(process.env.HOME || '', '.claude-code', 'config.json'),
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const fileContent = fs.readFileSync(configPath, 'utf-8');
          return JSON.parse(fileContent);
        } catch (error) {
          console.warn(`Failed to load config from ${configPath}:`, error);
        }
      }
    }

    return {};
  }

  private validateConfig(): void {
    if (!this.config.apiKey && !process.env.CLAUDE_API_KEY) {
      console.warn(
        'Warning: No API key found. Please set CLAUDE_API_KEY environment variable or provide it in the config.'
      );
    }

    if (this.config.temperature < 0 || this.config.temperature > 1) {
      throw new Error('Temperature must be between 0 and 1');
    }

    if (this.config.maxTokens < 1) {
      throw new Error('Max tokens must be at least 1');
    }

    if (this.config.timeout < 1000) {
      throw new Error('Timeout must be at least 1000ms');
    }

    if (this.config.maxRetries < 0) {
      throw new Error('Max retries must be non-negative');
    }
  }

  getConfig(): Required<ClaudeCodeConfig> {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ClaudeCodeConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    this.validateConfig();
  }

  get<K extends keyof ClaudeCodeConfig>(key: K): Required<ClaudeCodeConfig>[K] {
    return this.config[key];
  }

  set<K extends keyof ClaudeCodeConfig>(
    key: K,
    value: Required<ClaudeCodeConfig>[K]
  ): void {
    this.config[key] = value;
    this.validateConfig();
  }
}