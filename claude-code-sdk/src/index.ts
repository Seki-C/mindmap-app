export { ClaudeCodeClient, default } from './client';
export { BaseClient } from './client/base';
export { ConfigManager } from './config';
export * from './types';
export * from './errors';
export { default as Logger } from './utils/logger';

import { ClaudeCodeClient } from './client';
import { ConfigManager } from './config';
import { ClaudeCodeConfig } from './types';

export function createClient(config?: ClaudeCodeConfig): ClaudeCodeClient {
  const configManager = new ConfigManager(config);
  return new ClaudeCodeClient(configManager.getConfig());
}

export const VERSION = '0.1.0';