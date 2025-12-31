/**
 * Local Vault Storage using SQLite
 *
 * Provides encrypted local storage for vault items
 */
import type { Vault, VaultItem, ItemType, DecryptedItem } from '@passkeyper/core';
export interface VaultStorageOptions {
    /** Path to store the database file */
    dbPath: string;
    /** Enable verbose logging */
    verbose?: boolean;
}
export declare class VaultStorage {
    private db;
    private vaultKey;
    constructor(options: VaultStorageOptions);
    /**
     * Initialize database schema
     */
    private initializeDatabase;
    /**
     * Set the current vault encryption key
     */
    setVaultKey(key: Uint8Array): void;
    /**
     * Create a new vault
     */
    createVault(vault: Omit<Vault, 'id' | 'createdAt' | 'updatedAt'>): Vault;
    /**
     * Get vault by ID
     */
    getVault(id: string): Vault | null;
    /**
     * List all vaults
     */
    listVaults(): Vault[];
    /**
     * Create a new vault item (encrypted)
     */
    createItem(vaultId: string, item: DecryptedItem): Promise<VaultItem>;
    /**
     * Get item by ID (still encrypted)
     */
    getItem(id: string): VaultItem | null;
    /**
     * Get and decrypt item
     */
    getDecryptedItem(id: string): Promise<DecryptedItem | null>;
    /**
     * List items in vault
     */
    listItems(vaultId: string, options?: {
        type?: ItemType;
        favorite?: boolean;
        folderId?: string;
    }): VaultItem[];
    /**
     * Update item
     */
    updateItem(id: string, updates: Partial<DecryptedItem>): Promise<void>;
    /**
     * Delete item
     */
    deleteItem(id: string): void;
    /**
     * Mark item as used (update last_used_at)
     */
    markItemUsed(id: string): void;
    /**
     * Toggle favorite
     */
    toggleFavorite(id: string): void;
    /**
     * Search items by name
     */
    searchItems(vaultId: string, query: string): VaultItem[];
    /**
     * Close database connection
     */
    close(): void;
    /**
     * Convert database row to Vault object
     */
    private rowToVault;
    /**
     * Convert database row to VaultItem object
     */
    private rowToItem;
}
//# sourceMappingURL=vault-storage.d.ts.map