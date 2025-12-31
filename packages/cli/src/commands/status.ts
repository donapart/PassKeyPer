/**
 * Status Command
 */

import chalk from 'chalk';
import { getConfig, isLoggedIn } from '../config.js';
import { info, warn } from '../utils.js';

export async function statusCommand(): Promise<void> {
  console.log(chalk.cyan('\n🔐 PassKeyPer Status\n'));

  if (!isLoggedIn()) {
    warn('Not logged in');
    console.log(chalk.gray('Run "pkp login" to authenticate\n'));
    return;
  }

  const email = getConfig('email');
  const serverUrl = getConfig('serverUrl');
  const lastSync = getConfig('lastSync');

  console.log(`${chalk.bold('Email:')}     ${email}`);
  console.log(`${chalk.bold('Server:')}    ${serverUrl}`);
  console.log(`${chalk.bold('Status:')}    ${chalk.green('Authenticated')}`);
  
  if (lastSync) {
    console.log(`${chalk.bold('Last Sync:')} ${new Date(lastSync).toLocaleString()}`);
  }
  
  console.log();
}
