import { createClient } from '../src';
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
  NetworkError,
} from '../src/errors';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

async function errorHandlingExample() {
  console.log(chalk.blue.bold('⚠️  Claude Code SDK - Error Handling Example\n'));

  console.log(chalk.yellow('1. Handling Authentication Error:\n'));
  try {
    const clientWithBadKey = createClient({
      apiKey: 'invalid-api-key',
    });

    await clientWithBadKey.createCompletion('Hello');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log(chalk.red('Authentication failed:'), error.message);
      console.log(chalk.gray('Error code:'), error.code);
    }
  }

  console.log(chalk.yellow('\n2. Handling Validation Error:\n'));
  try {
    const client = createClient();
    await client.createCompletion('');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(chalk.red('Validation failed:'), error.message);
    }
  }

  console.log(chalk.yellow('\n3. Handling Rate Limit (simulated):\n'));
  const client = createClient({
    apiKey: process.env.CLAUDE_API_KEY,
    maxRetries: 2,
  });

  let requestCount = 0;
  const originalRequest = (client as any).request;
  (client as any).request = async function(...args: any[]) {
    requestCount++;
    
    if (requestCount <= 2) {
      throw new RateLimitError('Rate limit exceeded', 2);
    }
    
    return originalRequest.apply(this, args);
  };

  try {
    console.log(chalk.gray('Simulating rate limit...'));
    await client.createCompletion('Test prompt');
    console.log(chalk.green('Success after retries!'));
    console.log(chalk.gray(`Total attempts: ${requestCount}`));
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log(chalk.red('Rate limited:'), error.message);
      if (error.retryAfter) {
        console.log(chalk.gray(`Retry after: ${error.retryAfter} seconds`));
      }
    }
  }

  console.log(chalk.yellow('\n4. Handling Timeout:\n'));
  try {
    const timeoutClient = createClient({
      apiKey: process.env.CLAUDE_API_KEY,
      timeout: 1,
    });

    await timeoutClient.createCompletion('This will timeout');
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.log(chalk.red('Request timed out:'), error.message);
      console.log(chalk.gray('Details:'), error.details);
    }
  }

  console.log(chalk.yellow('\n5. Generic Error Handling Pattern:\n'));
  async function safeApiCall(prompt: string) {
    const client = createClient({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    try {
      const response = await client.createCompletion(prompt);
      return response;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log(chalk.red('🔐 Authentication Error:'), 'Check your API key');
      } else if (error instanceof RateLimitError) {
        console.log(chalk.yellow('⏱️  Rate Limited:'), `Wait ${error.retryAfter}s`);
      } else if (error instanceof ValidationError) {
        console.log(chalk.yellow('✏️  Validation Error:'), error.message);
      } else if (error instanceof TimeoutError) {
        console.log(chalk.red('⏰ Timeout:'), 'Request took too long');
      } else if (error instanceof NetworkError) {
        console.log(chalk.red('🌐 Network Error:'), 'Check your connection');
      } else {
        console.log(chalk.red('❌ Unknown Error:'), error);
      }
      
      return null;
    }
  }

  const result = await safeApiCall('What is error handling in programming?');
  if (result) {
    console.log(chalk.green('✅ Success:'), result.content.substring(0, 100) + '...');
  }
}

if (require.main === module) {
  errorHandlingExample().catch(console.error);
}