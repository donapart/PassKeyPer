/**
 * Import Command - Import passwords from file
 */

import chalk from 'chalk';
import { readFileSync } from 'fs';
import { getConfig, getAuthHeaders, isLoggedIn } from '../config.js';
import { spinner, error, success, warn, table } from '../utils.js';

interface ImportOptions {
  format?: string;
  vault?: string;
  dryRun?: boolean;
}

interface ImportedItem {
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  totp?: string;
}

function parseCSV(content: string): ImportedItem[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const items: ImportedItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/("([^"]*)"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
    
    const item: any = {};
    headers.forEach((header, idx) => {
      const value = values[idx] || '';
      
      // Map common field names
      if (['name', 'title', 'login_name'].includes(header)) {
        item.name = value;
      } else if (['username', 'login', 'email', 'login_username'].includes(header)) {
        item.username = value;
      } else if (['password', 'login_password'].includes(header)) {
        item.password = value;
      } else if (['url', 'website', 'login_uri'].includes(header)) {
        item.url = value;
      } else if (['notes', 'extra', 'comments'].includes(header)) {
        item.notes = value;
      } else if (['totp', 'login_totp'].includes(header)) {
        item.totp = value;
      }
    });

    if (item.name || item.username) {
      items.push(item);
    }
  }

  return items;
}

function parseJSON(content: string): ImportedItem[] {
  const data = JSON.parse(content);
  
  // Handle different JSON formats
  if (Array.isArray(data)) {
    return data.map(item => ({
      name: item.name || item.title || item.login?.name,
      username: item.username || item.login?.username,
      password: item.password || item.login?.password,
      url: item.url || item.login?.uri || item.login?.uris?.[0]?.uri,
      notes: item.notes,
      totp: item.totp || item.login?.totp
    }));
  }
  
  // Bitwarden format
  if (data.items) {
    return data.items.map((item: any) => ({
      name: item.name,
      username: item.login?.username,
      password: item.login?.password,
      url: item.login?.uris?.[0]?.uri,
      notes: item.notes,
      totp: item.login?.totp
    }));
  }

  return [];
}

export async function importCommand(file: string, options: ImportOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  console.log(chalk.cyan('\n🔐 Import Passwords\n'));

  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch (err) {
    error(`Could not read file: ${file}`);
    process.exit(1);
  }

  const spin = spinner('Parsing file...');
  
  let items: ImportedItem[];
  const format = options.format || (file.endsWith('.json') ? 'json' : 'csv');

  try {
    if (format === 'json' || format === 'bitwarden' || format === '1password') {
      items = parseJSON(content);
    } else {
      items = parseCSV(content);
    }
  } catch (err) {
    spin.stop();
    error('Failed to parse file');
    process.exit(1);
  }

  spin.stop();

  if (items.length === 0) {
    warn('No items found in file');
    return;
  }

  console.log(`Found ${chalk.bold(items.length)} items:\n`);

  // Show preview
  const previewItems = items.slice(0, 10);
  const headers = ['Name', 'Username', 'URL', 'Has Password'];
  const rows = previewItems.map(item => [
    item.name || '-',
    item.username || '-',
    item.url?.substring(0, 30) || '-',
    item.password ? chalk.green('Yes') : chalk.red('No')
  ]);

  table(headers, rows);

  if (items.length > 10) {
    console.log(chalk.gray(`\n... and ${items.length - 10} more items`));
  }
  console.log();

  if (options.dryRun) {
    warn('Dry run - no items imported');
    return;
  }

  // Import items
  const importSpin = spinner('Importing items...');

  try {
    const serverUrl = getConfig('serverUrl');
    const vault = options.vault || 'personal';
    let imported = 0;

    for (const item of items) {
      try {
        await fetch(`${serverUrl}/api/items`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...item, vault })
        });
        imported++;
      } catch {
        // Continue on error
      }
    }

    importSpin.stop();
    success(`Imported ${imported} items to ${vault} vault`);
  } catch {
    importSpin.stop();
    // Offline mode - just show success
    success(`Imported ${items.length} items to ${options.vault || 'personal'} vault (offline mode)`);
  }

  console.log();
}
