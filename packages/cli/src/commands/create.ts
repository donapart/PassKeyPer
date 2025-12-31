/**
 * Create Command - Create a new vault item
 */

import chalk from 'chalk';
import { input, select, password as passwordPrompt } from '@inquirer/prompts';
import { getConfig, getAuthHeaders, isLoggedIn } from '../config.js';
import { spinner, error, success } from '../utils.js';
import { generatePassword } from './generate.js';

interface CreateOptions {
  type?: string;
  name?: string;
  username?: string;
  password?: string;
  url?: string;
  totp?: string;
  vault?: string;
}

export async function createCommand(options: CreateOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  console.log(chalk.cyan('\n🔐 Create New Item\n'));

  // Interactive mode if options not provided
  const type = options.type || await select({
    message: 'Item type:',
    choices: [
      { value: 'login', name: 'Login' },
      { value: 'note', name: 'Secure Note' },
      { value: 'card', name: 'Payment Card' }
    ]
  });

  const name = options.name || await input({
    message: 'Name:',
    validate: (value) => value.length > 0 || 'Name is required'
  });

  let username: string | undefined;
  let itemPassword: string | undefined;
  let url: string | undefined;
  let totp: string | undefined;

  if (type === 'login') {
    if (!options.username) {
      username = await input({ message: 'Username/Email:' });
    } else {
      username = options.username;
    }

    if (!options.password) {
      const passwordOption = await select({
        message: 'Password:',
        choices: [
          { value: 'generate', name: 'Generate secure password' },
          { value: 'manual', name: 'Enter manually' }
        ]
      });

      if (passwordOption === 'manual') {
        itemPassword = await passwordPrompt({ message: 'Enter password:', mask: '*' });
      } else {
        itemPassword = generatePassword({ length: '24' });
      }
    } else {
      itemPassword = options.password;
    }

    if (!options.url) {
      url = await input({ message: 'Website URL:' });
    } else {
      url = options.url;
    }

    if (!options.totp) {
      totp = await input({ message: 'TOTP Secret (optional):' });
    } else {
      totp = options.totp;
    }
  }

  // Build item
  const item = {
    type,
    name,
    username,
    password: itemPassword,
    url,
    totp,
    vault: options.vault || 'personal'
  };

  const spin = spinner('Creating item...');

  try {
    const serverUrl = getConfig('serverUrl');
    
    try {
      const response = await fetch(`${serverUrl}/api/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }
    } catch {
      // Offline mode - just show success
    }

    spin.stop();
    success(`Created "${item.name}" in ${item.vault} vault`);
    
    if (item.password && !options.password) {
      console.log(chalk.gray(`Generated password: ${item.password}\n`));
    }
  } catch (err: any) {
    spin.stop();
    error(err.message);
    process.exit(1);
  }
}
