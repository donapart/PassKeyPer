#!/usr/bin/env node
/**
 * PassKeyPer CLI - Command Line Interface
 * 
 * A powerful command-line tool for managing passwords securely.
 * 
 * Usage:
 *   pkp login            - Login to your account
 *   pkp logout           - Logout from your account
 *   pkp list             - List all vault items
 *   pkp get <name>       - Get a specific item
 *   pkp create           - Create a new item
 *   pkp generate         - Generate a secure password
 *   pkp totp <name>      - Get TOTP code for an item
 *   pkp import <file>    - Import from file
 *   pkp export <file>    - Export to file
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { listCommand } from './commands/list.js';
import { getCommand } from './commands/get.js';
import { createCommand } from './commands/create.js';
import { generateCommand } from './commands/generate.js';
import { totpCommand } from './commands/totp.js';
import { importCommand } from './commands/import.js';
import { exportCommand } from './commands/export.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('pkp')
  .description(chalk.cyan('🔐 PassKeyPer CLI - Secure Password Manager'))
  .version('1.0.0');

// Authentication commands
program
  .command('login')
  .description('Login to your PassKeyPer account')
  .option('-e, --email <email>', 'Email address')
  .option('-s, --server <url>', 'Server URL', 'https://api.passkeyper.app')
  .action(loginCommand);

program
  .command('logout')
  .description('Logout from your account')
  .action(logoutCommand);

program
  .command('status')
  .description('Show current login status')
  .action(statusCommand);

// Vault commands
program
  .command('list')
  .alias('ls')
  .description('List all vault items')
  .option('-v, --vault <name>', 'Filter by vault name')
  .option('-t, --type <type>', 'Filter by type (login, note, card)')
  .option('-f, --favorites', 'Show only favorites')
  .option('--json', 'Output as JSON')
  .action(listCommand);

program
  .command('get <name>')
  .description('Get a specific item by name or ID')
  .option('-f, --field <field>', 'Get specific field (username, password, totp)')
  .option('-c, --copy', 'Copy to clipboard')
  .option('--json', 'Output as JSON')
  .action(getCommand);

program
  .command('create')
  .alias('add')
  .description('Create a new vault item')
  .option('-t, --type <type>', 'Item type (login, note, card)', 'login')
  .option('-n, --name <name>', 'Item name')
  .option('-u, --username <username>', 'Username')
  .option('-p, --password <password>', 'Password (or generate)')
  .option('--url <url>', 'Website URL')
  .option('--totp <secret>', 'TOTP secret')
  .option('-v, --vault <vault>', 'Target vault', 'personal')
  .action(createCommand);

// Password generator
program
  .command('generate')
  .alias('gen')
  .description('Generate a secure password')
  .option('-l, --length <length>', 'Password length', '24')
  .option('-u, --uppercase', 'Include uppercase letters', true)
  .option('-L, --lowercase', 'Include lowercase letters', true)
  .option('-n, --numbers', 'Include numbers', true)
  .option('-s, --symbols', 'Include symbols', true)
  .option('-w, --words', 'Generate passphrase instead')
  .option('--word-count <count>', 'Number of words for passphrase', '4')
  .option('-c, --copy', 'Copy to clipboard')
  .action(generateCommand);

// TOTP
program
  .command('totp <name>')
  .alias('otp')
  .description('Get TOTP code for an item')
  .option('-c, --copy', 'Copy to clipboard')
  .option('-w, --watch', 'Watch mode - continuously show new codes')
  .action(totpCommand);

// Import/Export
program
  .command('import <file>')
  .description('Import passwords from file')
  .option('-f, --format <format>', 'File format (csv, json, 1password, lastpass, bitwarden)', 'csv')
  .option('-v, --vault <vault>', 'Target vault', 'personal')
  .option('--dry-run', 'Show what would be imported without saving')
  .action(importCommand);

program
  .command('export <file>')
  .description('Export passwords to file')
  .option('-f, --format <format>', 'File format (csv, json)', 'json')
  .option('-v, --vault <vault>', 'Vault to export')
  .option('--encrypted', 'Export encrypted (JSON only)')
  .action(exportCommand);

// Parse and execute
program.parse();
