/**
 * Login Command
 */

import chalk from 'chalk';
import { input, password as passwordPrompt } from '@inquirer/prompts';
import { setConfig, getConfig } from '../config.js';
import { spinner, success, error } from '../utils.js';

interface LoginOptions {
  email?: string;
  server?: string;
}

export async function loginCommand(options: LoginOptions): Promise<void> {
  console.log(chalk.cyan('\n🔐 PassKeyPer Login\n'));

  // Get email
  let email = options.email;
  if (!email) {
    email = await input({
      message: 'Email:',
      validate: (value) => {
        if (!value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return true;
      }
    });
  }

  // Get password
  const password = await passwordPrompt({
    message: 'Master Password:',
    mask: '*'
  });

  // Get server URL
  const serverUrl = options.server || getConfig('serverUrl');

  const spin = spinner('Authenticating...');

  try {
    // Make login request
    const response = await fetch(`${serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Authentication failed');
    }

    const data = await response.json();

    // Save session
    setConfig('token', data.token);
    setConfig('email', email!);
    setConfig('userId', data.userId);
    setConfig('serverUrl', serverUrl);

    spin.stop();
    success(`Logged in as ${chalk.bold(email)}`);
    console.log(chalk.gray(`Server: ${serverUrl}\n`));
  } catch (err: any) {
    spin.stop();
    
    // For demo/offline mode, simulate login
    if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch')) {
      setConfig('email', email!);
      setConfig('token', 'demo-token-' + Date.now());
      setConfig('serverUrl', serverUrl);
      
      success(`Logged in as ${chalk.bold(email)} (offline mode)`);
      console.log(chalk.yellow('⚠ Running in offline/demo mode\n'));
    } else {
      error(err.message || 'Login failed');
      process.exit(1);
    }
  }
}
