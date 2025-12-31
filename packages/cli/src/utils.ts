/**
 * CLI Utilities
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import clipboard from 'clipboardy';

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function spinner(text: string): Ora {
  return ora({ text, color: 'cyan' }).start();
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await clipboard.write(text);
    success('Copied to clipboard');
  } catch (err) {
    error('Failed to copy to clipboard');
  }
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function maskPassword(password: string): string {
  if (password.length <= 4) {
    return '*'.repeat(password.length);
  }
  return password.slice(0, 2) + '*'.repeat(password.length - 4) + password.slice(-2);
}

export function table(headers: string[], rows: string[][]): void {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => (r[i] || '').length));
    return Math.max(h.length, maxRow);
  });

  // Print header
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
  const separator = widths.map(w => '─'.repeat(w)).join('─┼─');
  
  console.log(chalk.bold(headerLine));
  console.log(separator);

  // Print rows
  for (const row of rows) {
    const line = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' │ ');
    console.log(line);
  }
}

export function requireLogin(): void {
  const { isLoggedIn } = require('./config.js');
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }
}
