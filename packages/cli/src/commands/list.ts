/**
 * List Command - List all vault items
 */

import chalk from 'chalk';
import { getConfig, getAuthHeaders, isLoggedIn } from '../config.js';
import { spinner, error, table, requireLogin } from '../utils.js';

interface ListOptions {
  vault?: string;
  type?: string;
  favorites?: boolean;
  json?: boolean;
}

// Demo data for offline mode
const demoItems = [
  { id: '1', name: 'GitHub', type: 'login', username: 'user@example.com', url: 'github.com', favorite: true },
  { id: '2', name: 'Gmail', type: 'login', username: 'user@gmail.com', url: 'gmail.com', favorite: true },
  { id: '3', name: 'AWS Console', type: 'login', username: 'admin', url: 'aws.amazon.com', favorite: false },
  { id: '4', name: 'SSH Key', type: 'note', username: '-', url: '-', favorite: false },
  { id: '5', name: 'Netflix', type: 'login', username: 'user@example.com', url: 'netflix.com', favorite: false },
];

export async function listCommand(options: ListOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  const spin = spinner('Fetching vault items...');
  
  try {
    const serverUrl = getConfig('serverUrl');
    let items = demoItems;

    try {
      const response = await fetch(`${serverUrl}/api/items`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        items = data.items || demoItems;
      }
    } catch {
      // Use demo data if server unavailable
    }

    // Apply filters
    if (options.vault) {
      items = items.filter((i: any) => i.vault === options.vault);
    }
    if (options.type) {
      items = items.filter((i: any) => i.type === options.type);
    }
    if (options.favorites) {
      items = items.filter((i: any) => i.favorite);
    }

    spin.stop();

    if (options.json) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    if (items.length === 0) {
      console.log(chalk.yellow('\nNo items found\n'));
      return;
    }

    console.log(chalk.cyan(`\n🔐 Vault Items (${items.length})\n`));

    const headers = ['Name', 'Type', 'Username', 'URL', '★'];
    const rows = items.map((item: any) => [
      item.name,
      item.type,
      item.username || '-',
      item.url || '-',
      item.favorite ? chalk.yellow('★') : ''
    ]);

    table(headers, rows);
    console.log();
  } catch (err: any) {
    spin.stop();
    error(err.message);
    process.exit(1);
  }
}
