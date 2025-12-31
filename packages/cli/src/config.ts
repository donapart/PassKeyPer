/**
 * CLI Configuration Store
 * Stores session data, server URL, and cached credentials
 */

import Conf from 'conf';

interface ConfigSchema {
  serverUrl: string;
  token: string | null;
  email: string | null;
  userId: string | null;
  lastSync: string | null;
  defaultVault: string;
}

const config = new Conf<ConfigSchema>({
  projectName: 'passkeyper-cli',
  defaults: {
    serverUrl: 'https://api.passkeyper.app',
    token: null,
    email: null,
    userId: null,
    lastSync: null,
    defaultVault: 'personal'
  }
});

export function getConfig<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
  return config.get(key);
}

export function setConfig<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
  config.set(key, value);
}

export function clearConfig(): void {
  config.clear();
}

export function isLoggedIn(): boolean {
  return config.get('token') !== null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = config.get('token');
  if (!token) {
    throw new Error('Not logged in. Run "pkp login" first.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export { config };
