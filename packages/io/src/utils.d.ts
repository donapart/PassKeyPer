/**
 * Import utilities
 */
import type { VaultItem } from '@passkeyper/core';
/**
 * Validate imported items
 */
export declare function validateImport(items: VaultItem[]): {
    valid: VaultItem[];
    invalid: any[];
};
/**
 * Detect duplicate items
 */
export declare function detectDuplicates(items: VaultItem[], existingItems: VaultItem[]): VaultItem[];
/**
 * Merge strategy for duplicate items
 */
export type MergeStrategy = 'skip' | 'replace' | 'keep-both';
export declare function mergeItems(newItems: VaultItem[], existingItems: VaultItem[], strategy?: MergeStrategy): VaultItem[];
//# sourceMappingURL=utils.d.ts.map