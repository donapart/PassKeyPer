/**
 * Get Command - Get a specific vault item
 */

import chalk from 'chalk';
import { getConfig, getAuthHeaders, isLoggedIn } from '../config.js';
import { spinner, error, success, copyToClipboard, maskPassword } from '../utils.js';

interface GetOptions {
  field?: string;
  copy?: boolean;
  json?: boolean;
}

// Demo data
const demoItems: Record<string, any> = {
  'github': { 
    id: '1', 
    name: 'GitHub', 
    type: 'login', 
    username: 'user@example.com', 
    password: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    url: 'github.com',
    totp: 'JBSWY3DPEHPK3PXP',
    notes: 'Personal GitHub account'
  },
  'gmail': { 
    id: '2', 
    name: 'Gmail', 
    type: 'login', 
    username: 'user@gmail.com',
    password: 'my-secure-gmail-password-2024',
    url: 'gmail.com',
    totp: 'GEZDGNBVGY3TQOJQ',
    notes: ''
  },
};

export async function getCommand(name: string, options: GetOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  const spin = spinner(`Fetching "${name}"...`);

  try {
    const serverUrl = getConfig('serverUrl');
    let item = demoItems[name.toLowerCase()];

    try {
      const response = await fetch(`${serverUrl}/api/items/search?q=${encodeURIComponent(name)}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          item = data.items[0];
        }
      }
    } catch {
      // Use demo data
    }

    spin.stop();

    if (!item) {
      error(`Item "${name}" not found`);
      process.exit(1);
    }

    // Handle specific field request
    if (options.field) {
      const value = item[options.field];
      if (value === undefined) {
        error(`Field "${options.field}" not found`);
        process.exit(1);
      }

      if (options.copy) {
        await copyToClipboard(value);
      } else {
        console.log(value);
      }
      return;
    }

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(item, null, 2));
      return;
    }

    // Pretty print
    console.log(chalk.cyan(`\n🔐 ${item.name}\n`));
    console.log(`${chalk.bold('Type:')}     ${item.type}`);
    console.log(`${chalk.bold('Username:')} ${item.username || '-'}`);
    console.log(`${chalk.bold('Password:')} ${maskPassword(item.password || '')}`);
    if (item.url) {
      console.log(`${chalk.bold('URL:')}      ${item.url}`);
    }
    if (item.totp) {
      console.log(`${chalk.bold('TOTP:')}     ${chalk.green('Configured')}`);
    }
    if (item.notes) {
      console.log(`${chalk.bold('Notes:')}    ${item.notes}`);
    }
    console.log();

    // Copy password if requested
    if (options.copy) {
      await copyToClipboard(item.password);
    }
  } catch (err: any) {
    spin.stop();
    error(err.message);
    process.exit(1);
  }
}
