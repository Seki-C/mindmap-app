import { createClient } from '../src';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

async function streamingExample() {
  console.log(chalk.blue.bold('🌊 Claude Code SDK - Streaming Example\n'));

  const client = createClient({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  try {
    console.log(chalk.yellow('Streaming response for: "Explain quantum computing"\n'));
    
    let fullResponse = '';
    
    const response = await client.createCompletion(
      'Explain quantum computing in simple terms',
      {
        stream: true,
        onChunk: (chunk: string) => {
          process.stdout.write(chalk.green(chunk));
          fullResponse += chunk;
        },
      }
    );

    console.log('\n\n' + chalk.blue('Stream completed!'));
    console.log(chalk.gray(`Total characters: ${fullResponse.length}`));

  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
}

async function streamingWithSession() {
  console.log(chalk.blue.bold('\n📝 Streaming with Session Example\n'));

  const client = createClient({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  try {
    const sessionId = await client.createSession({
      topic: 'quantum-computing',
    });

    console.log(chalk.yellow('Question 1: What are qubits?\n'));
    
    await client.continueSession(sessionId, 'What are qubits?', {
      stream: true,
      onChunk: (chunk: string) => {
        process.stdout.write(chalk.cyan(chunk));
      },
    });

    console.log('\n\n' + chalk.yellow('Question 2: How do they differ from classical bits?\n'));
    
    await client.continueSession(
      sessionId,
      'How do they differ from classical bits?',
      {
        stream: true,
        onChunk: (chunk: string) => {
          process.stdout.write(chalk.magenta(chunk));
        },
      }
    );

    console.log('\n\n' + chalk.blue('Session completed!'));
    
    const session = client.getSession(sessionId);
    console.log(chalk.gray(`Total messages in session: ${session?.messages.length}`));

  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
}

if (require.main === module) {
  (async () => {
    await streamingExample();
    await streamingWithSession();
  })().catch(console.error);
}