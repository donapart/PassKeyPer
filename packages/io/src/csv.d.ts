/**
 * CSV Export/Import
 * Supports PassKeyPer format and other password managers
 */
import type { LoginItem, VaultItem } from '@passkeyper/core';
export interface CSVRow {
    name: string;
    url: string;
    username: string;
    password: string;
    notes?: string;
    folder?: string;
    favorite?: string;
    totp?: string;
}
/**
 * Export items to CSV
 */
export declare function exportToCSV(items: VaultItem[]): string;
/**
 * Import from PassKeyPer CSV
 */
export declare function importFromCSV(csv: string): LoginItem[];
/**
 * Import from 1Password CSV
 */
export declare function importFrom1Password(csv: string): LoginItem[];
/**
 * Import from Bitwarden JSON
 */
export declare function importFromBitwarden(json: string): LoginItem[];
/**
 * Import from LastPass CSV
 */
export declare function importFromLastPass(csv: string): LoginItem[];
/**
 * Import from Chrome passwords CSV
 */
export declare function importFromChrome(csv: string): LoginItem[];
/**
 * Detect import format from content
 */
export declare function detectImportFormat(content: string): 'passkeyper' | '1password' | 'bitwarden' | 'lastpass' | 'chrome' | 'unknown';
/**
 * Auto-import based on detected format
 */
export declare function autoImport(content: string): LoginItem[];
//# sourceMappingURL=csv.d.ts.map