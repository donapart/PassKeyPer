/**
 * TOTP Command - Get TOTP codes
 */

import chalk from 'chalk';
import { getConfig, isLoggedIn } from '../config.js';
import { error, copyToClipboard } from '../utils.js';

interface TotpOptions {
  copy?: boolean;
  watch?: boolean;
}

// Demo TOTP secrets
const demoSecrets: Record<string, string> = {
  'github': 'JBSWY3DPEHPK3PXP',
  'gmail': 'GEZDGNBVGY3TQOJQ',
  'aws': 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'
};

/**
 * Generate TOTP code from secret
 */
function generateTOTP(secret: string): string {
  // Base32 decode
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanSecret = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  let bits = '';
  for (const char of cleanSecret) {
    const val = base32Chars.indexOf(char);
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = new Uint8Array(bytes);

  // Get time counter (30 second window)
  const time = Math.floor(Date.now() / 1000 / 30);
  const timeBytes = new Uint8Array(8);
  let t = time;
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = t & 0xff;
    t = Math.floor(t / 256);
  }

  // Simplified HMAC-SHA1 (for demo purposes)
  // In production, use proper crypto library
  const hash = simpleHmacSha1(key, timeBytes);
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * Simplified HMAC-SHA1 for demo
 */
function simpleHmacSha1(key: Uint8Array, data: Uint8Array): Uint8Array {
  // This is a simplified version for demo
  // In production, use crypto.subtle.sign or a proper library
  
  // Generate pseudo-random but deterministic hash based on key and data
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key[i]) | 0;
  }
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  
  // Create 20-byte output
  const result = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    hash = ((hash * 1103515245) + 12345) | 0;
    result[i] = (hash >> 16) & 0xff;
  }
  
  return result;
}

/**
 * Get remaining seconds in current TOTP window
 */
function getRemainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

export async function totpCommand(name: string, options: TotpOptions): Promise<void> {
  if (!isLoggedIn()) {
    error('Not logged in. Run "pkp login" first.');
    process.exit(1);
  }

  // Find secret
  const secret = demoSecrets[name.toLowerCase()];
  
  if (!secret) {
    error(`No TOTP configured for "${name}"`);
    console.log(chalk.gray('Available items with TOTP: github, gmail, aws\n'));
    process.exit(1);
  }

  // Watch mode
  if (options.watch) {
    console.log(chalk.cyan(`\n🔐 TOTP for ${name}\n`));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));
    
    const update = () => {
      const code = generateTOTP(secret);
      const remaining = getRemainingSeconds();
      const bar = '█'.repeat(remaining) + '░'.repeat(30 - remaining);
      
      process.stdout.write(`\r${chalk.bold(code)}  [${bar}] ${remaining}s `);
    };

    update();
    setInterval(update, 1000);
    return;
  }

  // Single code
  const code = generateTOTP(secret);
  const remaining = getRemainingSeconds();

  console.log(chalk.cyan(`\n🔐 TOTP Code for ${name}\n`));
  console.log(`${chalk.bold.green(code)}  (${remaining}s remaining)`);
  console.log();

  if (options.copy) {
    await copyToClipboard(code);
  }
}
