/**
 * Generate Command - Generate secure passwords
 */

import chalk from 'chalk';
import { copyToClipboard, success } from '../utils.js';

interface GenerateOptions {
  length?: string;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  words?: boolean;
  wordCount?: string;
  copy?: boolean;
}

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const WORD_LIST = [
  'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'guitar', 'hammer',
  'island', 'jungle', 'kernel', 'lemon', 'mango', 'needle', 'orange', 'pepper',
  'quartz', 'rocket', 'silver', 'thunder', 'umbrella', 'violet', 'window', 'xenon',
  'yellow', 'zebra', 'anchor', 'bridge', 'castle', 'desert', 'engine', 'forest',
  'garden', 'harbor', 'iceberg', 'jacket', 'kitten', 'lantern', 'mountain', 'network',
  'ocean', 'planet', 'quantum', 'rainbow', 'sunset', 'tornado', 'unicorn', 'volcano'
];

export function generatePassword(options: GenerateOptions = {}): string {
  // Generate passphrase
  if (options.words) {
    const count = parseInt(options.wordCount || '4', 10);
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * WORD_LIST.length);
      words.push(WORD_LIST[idx]);
    }
    return words.join('-');
  }

  // Generate random password
  const length = parseInt(options.length || '24', 10);
  let charset = '';
  
  if (options.uppercase !== false) charset += CHARS.uppercase;
  if (options.lowercase !== false) charset += CHARS.lowercase;
  if (options.numbers !== false) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;
  
  if (!charset) charset = CHARS.lowercase + CHARS.uppercase + CHARS.numbers;

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const password = generatePassword(options);
  
  // Calculate entropy
  let charsetSize = 0;
  if (!options.words) {
    if (options.uppercase !== false) charsetSize += 26;
    if (options.lowercase !== false) charsetSize += 26;
    if (options.numbers !== false) charsetSize += 10;
    if (options.symbols) charsetSize += 28;
  }
  
  const length = options.words ? parseInt(options.wordCount || '4', 10) : parseInt(options.length || '24', 10);
  const entropy = options.words 
    ? Math.log2(Math.pow(WORD_LIST.length, length))
    : Math.log2(Math.pow(charsetSize, length));

  // Display
  console.log(chalk.cyan('\n🔐 Generated Password\n'));
  console.log(chalk.bold(password));
  console.log();
  
  // Strength indicator
  let strength = 'Weak';
  let strengthColor = chalk.red;
  if (entropy >= 128) {
    strength = 'Very Strong';
    strengthColor = chalk.green;
  } else if (entropy >= 80) {
    strength = 'Strong';
    strengthColor = chalk.green;
  } else if (entropy >= 60) {
    strength = 'Good';
    strengthColor = chalk.yellow;
  } else if (entropy >= 40) {
    strength = 'Fair';
    strengthColor = chalk.yellow;
  }

  console.log(`${chalk.gray('Strength:')} ${strengthColor(strength)} (${Math.round(entropy)} bits)`);
  console.log(`${chalk.gray('Length:')}   ${password.length} characters`);
  console.log();

  if (options.copy) {
    await copyToClipboard(password);
  }
}
