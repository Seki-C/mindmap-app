import { ConfigManager } from '../src/config';
import { ClaudeCodeConfig } from '../src/types';
import fs from 'fs';

jest.mock('fs');

describe('ConfigManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (fs.existsSync as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should load default config when no config is provided', () => {
      const manager = new ConfigManager();
      const config = manager.getConfig();

      expect(config.baseUrl).toBe('https://api.anthropic.com/v1');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.debug).toBe(false);
    });

    it('should override defaults with user config', () => {
      const userConfig: ClaudeCodeConfig = {
        apiKey: 'test-key',
        timeout: 60000,
        debug: true,
      };

      const manager = new ConfigManager(userConfig);
      const config = manager.getConfig();

      expect(config.apiKey).toBe('test-key');
      expect(config.timeout).toBe(60000);
      expect(config.debug).toBe(true);
    });

    it('should load config from environment variables', () => {
      process.env.CLAUDE_API_KEY = 'env-api-key';
      process.env.CLAUDE_BASE_URL = 'https://custom.api.com';
      process.env.CLAUDE_DEBUG = 'true';
      process.env.CLAUDE_TIMEOUT = '45000';

      const manager = new ConfigManager();
      const config = manager.getConfig();

      expect(config.apiKey).toBe('env-api-key');
      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.debug).toBe(true);
      expect(config.timeout).toBe(45000);
    });

    it('should prioritize user config over environment variables', () => {
      process.env.CLAUDE_API_KEY = 'env-key';
      
      const userConfig: ClaudeCodeConfig = {
        apiKey: 'user-key',
      };

      const manager = new ConfigManager(userConfig);
      const config = manager.getConfig();

      expect(config.apiKey).toBe('user-key');
    });
  });

  describe('validation', () => {
    it('should throw error for invalid temperature', () => {
      expect(() => {
        new ConfigManager({ temperature: 1.5 });
      }).toThrow('Temperature must be between 0 and 1');

      expect(() => {
        new ConfigManager({ temperature: -0.1 });
      }).toThrow('Temperature must be between 0 and 1');
    });

    it('should throw error for invalid maxTokens', () => {
      expect(() => {
        new ConfigManager({ maxTokens: 0 });
      }).toThrow('Max tokens must be at least 1');
    });

    it('should throw error for invalid timeout', () => {
      expect(() => {
        new ConfigManager({ timeout: 500 });
      }).toThrow('Timeout must be at least 1000ms');
    });

    it('should throw error for invalid maxRetries', () => {
      expect(() => {
        new ConfigManager({ maxRetries: -1 });
      }).toThrow('Max retries must be non-negative');
    });
  });

  describe('updateConfig', () => {
    it('should update config values', () => {
      const manager = new ConfigManager({ apiKey: 'initial-key' });
      
      manager.updateConfig({ apiKey: 'updated-key', debug: true });
      const config = manager.getConfig();

      expect(config.apiKey).toBe('updated-key');
      expect(config.debug).toBe(true);
    });

    it('should validate updated config', () => {
      const manager = new ConfigManager();

      expect(() => {
        manager.updateConfig({ temperature: 2.0 });
      }).toThrow('Temperature must be between 0 and 1');
    });
  });

  describe('get/set methods', () => {
    it('should get specific config value', () => {
      const manager = new ConfigManager({ apiKey: 'test-key' });
      
      expect(manager.get('apiKey')).toBe('test-key');
      expect(manager.get('debug')).toBe(false);
    });

    it('should set specific config value', () => {
      const manager = new ConfigManager();
      
      manager.set('apiKey', 'new-key');
      manager.set('debug', true);

      expect(manager.get('apiKey')).toBe('new-key');
      expect(manager.get('debug')).toBe(true);
    });

    it('should validate when setting values', () => {
      const manager = new ConfigManager();

      expect(() => {
        manager.set('temperature', 1.5);
      }).toThrow('Temperature must be between 0 and 1');
    });
  });
});