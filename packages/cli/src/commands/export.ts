/**
 * Export Command - Export passwords to file
 */

import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { getConfig, getAuthHeaders, isLoggedIn } from '../config.js';
import { spinner, error, success, warn, table } from '../utils.js';
import { input, select, confirm } from '@inquirer/prompts';

interface ExportOptions {
  format?: string;
  vault?: string;
  output?: string;
}

interface VaultItem {
  id: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  totp?: string;
}

// Demo data for offline mode
const demoItems: VaultItem[] = [
  { id: '1', name: 'GitHub', username: 'dev@example.com', password: 'GhP@ss2024!', url: 'https://github.com', totp: 'JBSWY3DPEHPK3PXP' },
  { id: '2', name: 'Gmail', username: 'user@gmail.com', password: 'Gm@il2024Secure', url: 'https://gmail.com' },
  { id: '3', name: 'AWS Console', username: 'admin@company.com', password: 'Aws#Admin2024!', url: 'https://aws.amazon.com' },
  { id: '4', name: 'Netflix', username: 'movie@example.com', password: 'Nflix!Watch2024', url: 'https://netflix.com' },
  { id: '5', name: 'LinkedIn', username: 'professional@example.com', password: 'LnkdIn#Pro2024', url: 'https://linkedin.com' },
];

function toCSV(items: VaultItem[]): string {
  const headers = ['name', 'username', 'password', 'url', 'notes', 'totp'];
  const rows = items.map(item => 
    headers.map(h => {
      const value = (item as any)[h] || '';
      // Escape quotes and wrap in quotes if contains comma
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

function toJSON(items: VaultItem[]): string {
  return JSON.stringify({
    encrypted: false,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      login: {
        username: item.username,
        password: item.password,
        uris: item.url ? [{ uri: item.url }] : [],
        totp: item.totp
      },
      notes: item.notes || null
    }))
  }, null, 2);
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  console.log(chalk.cyan('\n🔐 Export Passwords\n'));

  // Get format
  const format = options.format || await select({
    message: 'Export format:',
    choices: [
      { value: 'csv', name: 'CSV (Universal)' },
      { value: 'json', name: 'JSON (PassKeyPer/Bitwarden compatible)' }
    ]
  });

  // Get vault
  const vault = options.vault || await select({
    message: 'Export from vault:',
    choices: [
      { value: 'all', name: 'All Vaults' },
      { value: 'personal', name: 'Personal Vault' },
      { value: 'work', name: 'Work Vault' }
    ]
  });

  // Security warning
  console.log();
  warn('⚠️  SECURITY WARNING');
  console.log(chalk.yellow('  Exported file will contain UNENCRYPTED passwords!'));
  console.log(chalk.yellow('  Store securely and delete after use.\n'));

  const confirmed = await confirm({
    message: 'Proceed with export?',
    default: false
  });

  if (!confirmed) {
    console.log(chalk.gray('\nExport cancelled.\n'));
    return;
  }

  const spin = spinner('Fetching items...');

  let items: VaultItem[];
  try {
    const serverUrl = getConfig('serverUrl');
    const url = vault === 'all' ? `${serverUrl}/api/items` : `${serverUrl}/api/items?vault=${vault}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    items = await response.json();
  } catch {
    // Use demo data in offline mode
    items = demoItems;
    spin.stop();
    warn('Server unavailable - using demo data');
    spin.start();
  }

  spin.stop();

  if (items.length === 0) {
    warn('No items to export');
    return;
  }

  console.log(`\nExporting ${chalk.bold(items.length)} items...\n`);

  // Generate content
  const content = format === 'json' ? toJSON(items) : toCSV(items);

  // Get output filename
  const defaultFilename = `passkeyper-export-${new Date().toISOString().split('T')[0]}.${format}`;
  const filename = options.output || await input({
    message: 'Output filename:',
    default: defaultFilename
  });

  // Write file
  try {
    writeFileSync(filename, content, 'utf-8');
    success(`Exported to ${filename}`);
    
    // Show summary
    console.log('\n' + chalk.gray('─'.repeat(40)));
    console.log(`  📄 Format: ${format.toUpperCase()}`);
    console.log(`  🔐 Items: ${items.length}`);
    console.log(`  📁 File: ${filename}`);
    console.log(chalk.gray('─'.repeat(40)));
  } catch (err) {
    error(`Failed to write file: ${filename}`);
    process.exit(1);
  }

  console.log();
}
