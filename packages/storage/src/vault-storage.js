/**
 * Local Vault Storage using SQLite
 *
 * Provides encrypted local storage for vault items
 */
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '@passkeyper/core';
import path from 'path';
import fs from 'fs';
export class VaultStorage {
    constructor(options) {
        this.vaultKey = null;
        // Ensure directory exists
        const dir = path.dirname(options.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(options.dbPath, {
            verbose: options.verbose ? console.log : undefined,
        });
        this.initializeDatabase();
    }
    /**
     * Initialize database schema
     */
    initializeDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS vaults (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        encrypted_key TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vault_items (
        id TEXT PRIMARY KEY,
        vault_id TEXT NOT NULL,
        type TEXT NOT NULL,
        encrypted_data TEXT NOT NULL,
        name TEXT NOT NULL,
        favorite INTEGER DEFAULT 0,
        tags TEXT,
        folder_id TEXT,
        version INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_used_at INTEGER,
        FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        vault_id TEXT NOT NULL,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_items_vault_id ON vault_items(vault_id);
      CREATE INDEX IF NOT EXISTS idx_items_type ON vault_items(type);
      CREATE INDEX IF NOT EXISTS idx_items_favorite ON vault_items(favorite);
      CREATE INDEX IF NOT EXISTS idx_folders_vault_id ON folders(vault_id);
      CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
    `);
    }
    /**
     * Set the current vault encryption key
     */
    setVaultKey(key) {
        this.vaultKey = key;
    }
    /**
     * Create a new vault
     */
    createVault(vault) {
        const id = uuidv4();
        const now = Date.now();
        const stmt = this.db.prepare(`
      INSERT INTO vaults (id, name, type, encrypted_key, icon, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, vault.name, vault.type, vault.encryptedKey, vault.icon || null, vault.color || null, now, now);
        return {
            id,
            ...vault,
            createdAt: new Date(now),
            updatedAt: new Date(now),
        };
    }
    /**
     * Get vault by ID
     */
    getVault(id) {
        const stmt = this.db.prepare('SELECT * FROM vaults WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.rowToVault(row);
    }
    /**
     * List all vaults
     */
    listVaults() {
        const stmt = this.db.prepare('SELECT * FROM vaults ORDER BY name');
        const rows = stmt.all();
        return rows.map((row) => this.rowToVault(row));
    }
    /**
     * Create a new vault item (encrypted)
     */
    async createItem(vaultId, item) {
        if (!this.vaultKey) {
            throw new Error('Vault key not set. Call setVaultKey() first.');
        }
        const id = uuidv4();
        const now = Date.now();
        // Encrypt the item data
        const plaintext = JSON.stringify(item);
        const encryptedBlob = await encrypt(plaintext, this.vaultKey);
        const encryptedData = JSON.stringify(encryptedBlob);
        const stmt = this.db.prepare(`
      INSERT INTO vault_items (
        id, vault_id, type, encrypted_data, name, favorite, tags,
        folder_id, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, vaultId, item.type, encryptedData, item.name, 0, '', null, 1, now, now);
        return {
            id,
            vaultId,
            type: item.type,
            encryptedData,
            metadata: {
                name: item.name,
                favorite: false,
                tags: [],
                folderId: undefined,
            },
            version: 1,
            createdAt: new Date(now),
            updatedAt: new Date(now),
        };
    }
    /**
     * Get item by ID (still encrypted)
     */
    getItem(id) {
        const stmt = this.db.prepare('SELECT * FROM vault_items WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.rowToItem(row);
    }
    /**
     * Get and decrypt item
     */
    async getDecryptedItem(id) {
        if (!this.vaultKey) {
            throw new Error('Vault key not set');
        }
        const item = this.getItem(id);
        if (!item)
            return null;
        const encryptedBlob = JSON.parse(item.encryptedData);
        const plaintext = await decrypt(encryptedBlob, this.vaultKey);
        const decrypted = JSON.parse(plaintext);
        return decrypted;
    }
    /**
     * List items in vault
     */
    listItems(vaultId, options) {
        let query = 'SELECT * FROM vault_items WHERE vault_id = ?';
        const params = [vaultId];
        if (options?.type) {
            query += ' AND type = ?';
            params.push(options.type);
        }
        if (options?.favorite !== undefined) {
            query += ' AND favorite = ?';
            params.push(options.favorite ? 1 : 0);
        }
        if (options?.folderId) {
            query += ' AND folder_id = ?';
            params.push(options.folderId);
        }
        query += ' ORDER BY name';
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map((row) => this.rowToItem(row));
    }
    /**
     * Update item
     */
    async updateItem(id, updates) {
        if (!this.vaultKey) {
            throw new Error('Vault key not set');
        }
        // Get current item and decrypt
        const currentItem = await this.getDecryptedItem(id);
        if (!currentItem) {
            throw new Error('Item not found');
        }
        // Merge updates
        const updatedItem = { ...currentItem, ...updates };
        // Re-encrypt
        const plaintext = JSON.stringify(updatedItem);
        const encryptedBlob = await encrypt(plaintext, this.vaultKey);
        const encryptedData = JSON.stringify(encryptedBlob);
        const stmt = this.db.prepare(`
      UPDATE vault_items
      SET encrypted_data = ?, name = ?, updated_at = ?, version = version + 1
      WHERE id = ?
    `);
        stmt.run(encryptedData, updatedItem.name, Date.now(), id);
    }
    /**
     * Delete item
     */
    deleteItem(id) {
        const stmt = this.db.prepare('DELETE FROM vault_items WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Mark item as used (update last_used_at)
     */
    markItemUsed(id) {
        const stmt = this.db.prepare(`
      UPDATE vault_items SET last_used_at = ? WHERE id = ?
    `);
        stmt.run(Date.now(), id);
    }
    /**
     * Toggle favorite
     */
    toggleFavorite(id) {
        const stmt = this.db.prepare(`
      UPDATE vault_items SET favorite = NOT favorite WHERE id = ?
    `);
        stmt.run(id);
    }
    /**
     * Search items by name
     */
    searchItems(vaultId, query) {
        const stmt = this.db.prepare(`
      SELECT * FROM vault_items
      WHERE vault_id = ? AND name LIKE ?
      ORDER BY name
    `);
        const rows = stmt.all(vaultId, `%${query}%`);
        return rows.map((row) => this.rowToItem(row));
    }
    /**
     * Close database connection
     */
    close() {
        this.db.close();
    }
    /**
     * Convert database row to Vault object
     */
    rowToVault(row) {
        return {
            id: row.id,
            userId: '', // Will be set by app layer
            name: row.name,
            type: row.type,
            encryptedKey: row.encrypted_key,
            icon: row.icon,
            color: row.color,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
    /**
     * Convert database row to VaultItem object
     */
    rowToItem(row) {
        return {
            id: row.id,
            vaultId: row.vault_id,
            type: row.type,
            encryptedData: row.encrypted_data,
            metadata: {
                name: row.name,
                favorite: Boolean(row.favorite),
                tags: row.tags ? row.tags.split(',') : [],
                folderId: row.folder_id,
            },
            version: row.version,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
        };
    }
}
//# sourceMappingURL=vault-storage.js.map