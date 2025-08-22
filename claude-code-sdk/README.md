# Claude Code SDK

Official TypeScript SDK for Claude Code - An interactive CLI tool for coding with Claude.

## Features

- 🚀 **Simple API** - Easy-to-use interface for interacting with Claude
- 🔄 **Session Management** - Maintain conversation context across multiple interactions
- 🌊 **Streaming Support** - Real-time streaming responses
- 🛠️ **Tool Integration** - Execute tools and commands within conversations
- ⚡ **Automatic Retries** - Built-in exponential backoff for rate limits
- 🎯 **Type Safety** - Full TypeScript support with comprehensive type definitions
- 📝 **Comprehensive Logging** - Debug mode for detailed operation insights
- ⚙️ **Flexible Configuration** - Multiple configuration options (env, files, code)

## Installation

```bash
npm install @claude/code-sdk
```

or

```bash
yarn add @claude/code-sdk
```

## Quick Start

```typescript
import { createClient } from '@claude/code-sdk';

// Create a client instance
const client = createClient({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Simple completion
const response = await client.createCompletion('Explain TypeScript generics');
console.log(response.content);
```

## Configuration

### Environment Variables

```bash
CLAUDE_API_KEY=your-api-key
CLAUDE_BASE_URL=https://api.anthropic.com/v1
CLAUDE_TIMEOUT=30000
CLAUDE_MAX_RETRIES=3
CLAUDE_DEBUG=true
CLAUDE_MODEL=claude-3-opus-20240229
CLAUDE_TEMPERATURE=0.7
CLAUDE_MAX_TOKENS=4096
```

### Configuration Files

The SDK looks for configuration files in the following order:

1. `.claude-code.json` in the current directory
2. `claude-code.config.json` in the current directory
3. `~/.claude-code/config.json` in your home directory

Example configuration file:

```json
{
  "apiKey": "your-api-key",
  "model": "claude-3-opus-20240229",
  "temperature": 0.7,
  "maxTokens": 4096,
  "debug": false
}
```

### Programmatic Configuration

```typescript
import { createClient } from '@claude/code-sdk';

const client = createClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.anthropic.com/v1',
  timeout: 60000,
  maxRetries: 5,
  debug: true,
  model: 'claude-3-opus-20240229',
  temperature: 0.8,
  maxTokens: 8192,
});
```

## API Reference

### Creating a Client

```typescript
import { createClient } from '@claude/code-sdk';

const client = createClient(config?: ClaudeCodeConfig);
```

### Basic Completion

```typescript
const response = await client.createCompletion(
  prompt: string,
  options?: ConversationOptions
);
```

### Session Management

```typescript
// Create a session
const sessionId = await client.createSession(metadata?: Record<string, any>);

// Continue a session
const response = await client.continueSession(
  sessionId: string,
  prompt: string,
  options?: ConversationOptions
);

// Get session details
const session = client.getSession(sessionId: string);

// List all sessions
const sessions = client.listSessions();

// Clear a session
const success = client.clearSession(sessionId: string);
```

### Streaming Responses

```typescript
const response = await client.createCompletion('Your prompt', {
  stream: true,
  onChunk: (chunk: string) => {
    process.stdout.write(chunk);
  },
});
```

### Using Tools

```typescript
const tools = [
  {
    name: 'calculator',
    description: 'Performs mathematical calculations',
    parameters: {
      operation: 'string',
      numbers: 'array',
    },
  },
];

const response = await client.executeWithTools(
  'Calculate the sum of 15 and 27',
  tools,
  {
    workingDirectory: process.cwd(),
    allowedOperations: ['read', 'write'],
  }
);
```

## Error Handling

The SDK provides specific error classes for different scenarios:

```typescript
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
  NetworkError,
  ToolExecutionError,
} from '@claude/code-sdk';

try {
  const response = await client.createCompletion('Your prompt');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  }
}
```

## Examples

Check the `examples/` directory for complete examples:

- `basic.ts` - Basic usage examples
- `streaming.ts` - Streaming response examples
- `error-handling.ts` - Error handling patterns

Run examples:

```bash
npm run example
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please visit [GitHub Issues](https://github.com/anthropics/claude-code-sdk/issues).