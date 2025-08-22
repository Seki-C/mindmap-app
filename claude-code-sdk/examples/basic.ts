import { createClient } from '../src';
import dotenv from 'dotenv';

dotenv.config();

async function basicExample() {
  console.log('🚀 Claude Code SDK - Basic Example\n');

  const client = createClient({
    apiKey: process.env.CLAUDE_API_KEY,
    debug: true,
  });

  try {
    console.log('1. Simple completion:');
    const response = await client.createCompletion(
      'What is TypeScript and why is it useful?'
    );
    console.log('Response:', response.content);
    console.log('Tokens used:', response.usage);
    console.log('\n---\n');

    console.log('2. Completion with system prompt:');
    const codeResponse = await client.createCompletion(
      'Write a function to calculate fibonacci numbers',
      {
        systemPrompt: 'You are a coding assistant. Provide clean, well-commented code.',
      }
    );
    console.log('Code Response:', codeResponse.content);
    console.log('\n---\n');

    console.log('3. Session management:');
    const sessionId = await client.createSession({
      project: 'fibonacci-calculator',
    });
    console.log('Created session:', sessionId);

    const session1 = await client.continueSession(
      sessionId,
      'Can you explain what fibonacci numbers are?'
    );
    console.log('First response:', session1.content);

    const session2 = await client.continueSession(
      sessionId,
      'Now write the code for it in TypeScript'
    );
    console.log('Second response:', session2.content);

    const sessionState = client.getSession(sessionId);
    console.log('Total messages in session:', sessionState?.messages.length);
    console.log('\n---\n');

    console.log('4. Using with tools:');
    const tools = [
      {
        name: 'file_reader',
        description: 'Reads content from a file',
        parameters: {
          path: 'string',
        },
      },
      {
        name: 'file_writer',
        description: 'Writes content to a file',
        parameters: {
          path: 'string',
          content: 'string',
        },
      },
    ];

    const toolResponse = await client.executeWithTools(
      'Read the package.json file and tell me the version',
      tools,
      {
        workingDirectory: process.cwd(),
        allowedOperations: ['read'],
      }
    );
    console.log('Tool Response:', toolResponse.content);

  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  basicExample().catch(console.error);
}