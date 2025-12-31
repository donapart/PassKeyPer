/**
 * Logout Command
 */

import chalk from 'chalk';
import { clearConfig, getConfig, isLoggedIn } from '../config.js';
import { success, warn } from '../utils.js';

export async function logoutCommand(): Promise<void> {
  if (!isLoggedIn()) {
    warn('Not currently logged in');
    return;
  }

  const email = getConfig('email');
  clearConfig();
  
  success(`Logged out from ${chalk.bold(email)}`);
}
