/**
 * JSON Export/Import with encryption
 */
import type { VaultItem } from '@passkeyper/core';
export interface EncryptedExport {
    version: string;
    encrypted: true;
    data: {
        iv: string;
        ciphertext: string;
        tag: string;
    };
    timestamp: string;
}
export interface PlainExport {
    version: string;
    encrypted: false;
    items: VaultItem[];
    timestamp: string;
}
/**
 * Export to encrypted JSON
 */
export declare function exportToJSON(items: VaultItem[], encryptionKey?: Uint8Array): Promise<string>;
/**
 * Import from JSON
 */
export declare function importFromJSON(json: string, decryptionKey?: Uint8Array): Promise<VaultItem[]>;
//# sourceMappingURL=json.d.ts.map