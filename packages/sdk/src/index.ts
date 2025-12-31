/**
 * PassKeyPer SDK
 * 
 * Easy-to-use SDK for integrating with PassKeyPer password manager.
 * Provides a high-level API for vault operations, encryption, and sync.
 * 
 * @example
 * ```typescript
 * import { PassKeyPer } from '@passkeyper/sdk';
 * 
 * const pkp = new PassKeyPer({
 *   serverUrl: 'https://api.passkeyper.io',
 * });
 * 
 * await pkp.login('user@example.com', 'masterPassword');
 * 
 * const items = await pkp.getItems();
 * ```
 * 
 * @module @passkeyper/sdk
 */

import {
  deriveMasterKey,
  deriveKeys,
  deriveServerHash,
  generateSalt,
  encrypt,
  decrypt,
  generatePassword,
  generatePassphrase,
  calculateStrength,
  isWebAuthnAvailable,
  registerPasskey,
  authenticateWithPasskey,
  type PasswordGeneratorOptions,
  type PassphraseGeneratorOptions,
  type LoginItem,
  type SecureNote,
  type CreditCard,
} from '@passkeyper/core';

export interface SDKConfig {
  /** Server URL for PassKeyPer API */
  serverUrl: string;
  /** Auto-sync interval in milliseconds (0 to disable) */
  syncInterval?: number;
  /** Storage adapter (defaults to localStorage in browser) */
  storage?: StorageAdapter;
  /** Enable debug logging */
  debug?: boolean;
}

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

export interface VaultItemResponse {
  id: string;
  name: string;
  type: string;
  username?: string;
  url?: string;
  lastUsedAt?: Date;
}

/**
 * Main SDK class for PassKeyPer
 */
export class PassKeyPer {
  private config: SDKConfig;
  private token: string | null = null;
  private masterKey: Uint8Array | null = null;
  private encryptionKey: Uint8Array | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: SDKConfig) {
    this.config = {
      syncInterval: 0,
      debug: false,
      ...config
    };
  }

  /**
   * Log in with email and master password
   */
  async login(email: string, masterPassword: string): Promise<AuthResult> {
    try {
      // Derive keys locally
      const salt = await this.fetchSalt(email);
      this.masterKey = await deriveMasterKey(masterPassword, salt);
      
      const { encryptionKey } = deriveKeys(this.masterKey, email);
      this.encryptionKey = encryptionKey;

      // Get server hash for authentication
      const serverHash = await deriveServerHash(this.masterKey, email);

      // Authenticate with server
      const response = await fetch(`${this.config.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, serverHash })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { success: false, error: error.message || 'Authentication failed' };
      }

      const data = await response.json();
      this.token = data.token;

      // Start auto-sync if enabled
      if (this.config.syncInterval && this.config.syncInterval > 0) {
        this.startAutoSync();
      }

      this.log('Logged in successfully');
      return { success: true, userId: data.userId, token: data.token };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log in with passkey (WebAuthn)
   */
  async loginWithPasskey(): Promise<AuthResult> {
    if (!isWebAuthnAvailable()) {
      return { success: false, error: 'WebAuthn is not available' };
    }

    try {
      // Get authentication options from server
      const optionsResponse = await fetch(`${this.config.serverUrl}/api/auth/webauthn/options`);
      const options = await optionsResponse.json();

      // Authenticate with passkey
      const credential = await authenticateWithPasskey(options);

      // Verify with server
      const response = await fetch(`${this.config.serverUrl}/api/auth/webauthn/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential)
      });

      if (!response.ok) {
        return { success: false, error: 'Passkey verification failed' };
      }

      const data = await response.json();
      this.token = data.token;

      return { success: true, userId: data.userId, token: data.token };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a new passkey for the current user
   */
  async registerPasskey(name: string): Promise<{ success: boolean; error?: string }> {
    if (!this.token) {
      return { success: false, error: 'Not logged in' };
    }

    if (!isWebAuthnAvailable()) {
      return { success: false, error: 'WebAuthn is not available' };
    }

    try {
      // Get registration options from server
      const optionsResponse = await fetch(`${this.config.serverUrl}/api/auth/webauthn/register`, {
        headers: this.getAuthHeaders()
      });
      const options = await optionsResponse.json();

      // Create passkey
      const credential = await registerPasskey(options);

      // Store on server
      const response = await fetch(`${this.config.serverUrl}/api/auth/webauthn/register/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ...credential, name })
      });

      return { success: response.ok };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log out and clear session
   */
  logout(): void {
    this.stopAutoSync();
    this.token = null;
    this.masterKey = null;
    this.encryptionKey = null;
    this.log('Logged out');
  }

  /**
   * Check if currently logged in
   */
  isLoggedIn(): boolean {
    return this.token !== null && this.encryptionKey !== null;
  }

  /**
   * Get all vault items
   */
  async getItems(vaultId?: string): Promise<VaultItemResponse[]> {
    this.ensureLoggedIn();

    const url = vaultId 
      ? `${this.config.serverUrl}/api/items?vault=${vaultId}`
      : `${this.config.serverUrl}/api/items`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    const items = await response.json();
    return items.map((item: any) => this.decryptItemMetadata(item));
  }

  /**
   * Get a single item by ID (decrypted)
   */
  async getItem(itemId: string): Promise<LoginItem | SecureNote | CreditCard | null> {
    this.ensureLoggedIn();

    const response = await fetch(`${this.config.serverUrl}/api/items/${itemId}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      return null;
    }

    const item = await response.json();
    return this.decryptItem(item);
  }

  /**
   * Create a new vault item
   */
  async createItem(item: Partial<LoginItem | SecureNote | CreditCard>): Promise<string> {
    this.ensureLoggedIn();

    const encryptedData = await encrypt(JSON.stringify(item), this.encryptionKey!);

    const response = await fetch(`${this.config.serverUrl}/api/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        type: item.type,
        encryptedData,
        metadata: {
          name: item.name,
          favorite: false,
          tags: []
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create item');
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Update an existing item
   */
  async updateItem(itemId: string, updates: Partial<LoginItem | SecureNote | CreditCard>): Promise<void> {
    this.ensureLoggedIn();

    const existing = await this.getItem(itemId);
    if (!existing) {
      throw new Error('Item not found');
    }

    const updated = { ...existing, ...updates };
    const encryptedData = await encrypt(JSON.stringify(updated), this.encryptionKey!);

    const response = await fetch(`${this.config.serverUrl}/api/items/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ encryptedData })
    });

    if (!response.ok) {
      throw new Error('Failed to update item');
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(itemId: string): Promise<void> {
    this.ensureLoggedIn();

    const response = await fetch(`${this.config.serverUrl}/api/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
  }

  /**
   * Search items by query
   */
  async searchItems(query: string): Promise<VaultItemResponse[]> {
    const items = await this.getItems();
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.username?.toLowerCase().includes(lowerQuery) ||
      item.url?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Generate a secure password
   */
  generatePassword(options?: Partial<PasswordGeneratorOptions>): string {
    return generatePassword({
      length: options?.length || 16,
      includeUppercase: options?.includeUppercase ?? true,
      includeLowercase: options?.includeLowercase ?? true,
      includeNumbers: options?.includeNumbers ?? true,
      includeSymbols: options?.includeSymbols ?? true,
      excludeAmbiguous: options?.excludeAmbiguous ?? false,
    });
  }

  /**
   * Generate a memorable passphrase
   */
  generatePassphrase(options?: Partial<PassphraseGeneratorOptions>): string {
    return generatePassphrase({
      wordCount: options?.wordCount || 4,
      separator: options?.separator || '-',
      capitalize: options?.capitalize ?? true,
      includeNumber: options?.includeNumber ?? true,
    });
  }

  /**
   * Calculate password strength
   */
  checkPasswordStrength(password: string) {
    return calculateStrength(password);
  }

  /**
   * Sync vault with server
   */
  async sync(): Promise<{ success: boolean; changes: number }> {
    this.ensureLoggedIn();
    this.log('Starting sync...');

    try {
      const response = await fetch(`${this.config.serverUrl}/api/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        return { success: false, changes: 0 };
      }

      const data = await response.json();
      this.log(`Sync complete: ${data.changes} changes`);
      return { success: true, changes: data.changes };
    } catch {
      return { success: false, changes: 0 };
    }
  }

  // Private methods

  private async fetchSalt(email: string): Promise<Uint8Array> {
    const response = await fetch(`${this.config.serverUrl}/api/auth/salt?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      // Generate new salt for new users
      return generateSalt();
    }

    const data = await response.json();
    return new Uint8Array(Buffer.from(data.salt, 'base64'));
  }

  private decryptItemMetadata(item: any): VaultItemResponse {
    return {
      id: item.id,
      name: item.metadata?.name || 'Unnamed',
      type: item.type,
      username: item.metadata?.username,
      url: item.metadata?.url,
      lastUsedAt: item.lastUsedAt ? new Date(item.lastUsedAt) : undefined
    };
  }

  private async decryptItem(item: any): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Not logged in');
    }

    const decryptedData = await decrypt(item.encryptedData, this.encryptionKey);
    return JSON.parse(decryptedData);
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  private ensureLoggedIn(): void {
    if (!this.token || !this.encryptionKey) {
      throw new Error('Not logged in. Call login() first.');
    }
  }

  private startAutoSync(): void {
    if (this.syncTimer) return;
    
    this.syncTimer = setInterval(() => {
      this.sync().catch(console.error);
    }, this.config.syncInterval!);
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[PassKeyPer SDK] ${message}`);
    }
  }
}

// Export types
export type {
  PasswordGeneratorOptions,
  PassphraseGeneratorOptions,
  VaultItem,
  LoginItem,
  SecureNote,
  CreditCard,
} from '@passkeyper/core';

// Export utilities
export {
  generatePassword,
  generatePassphrase,
  calculateStrength,
  isWebAuthnAvailable,
} from '@passkeyper/core';

// Default export
export default PassKeyPer;
