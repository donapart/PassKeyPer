/**
 * JSON Export/Import with encryption
 */
import { encrypt, decrypt } from '@passkeyper/core';
/**
 * Export to encrypted JSON
 */
export async function exportToJSON(items, encryptionKey) {
    const exportData = {
        version: '0.2.0',
        encrypted: false,
        items,
        timestamp: new Date().toISOString(),
    };
    if (encryptionKey) {
        const plaintext = JSON.stringify(exportData);
        const encrypted = await encrypt(plaintext, encryptionKey);
        const encryptedExport = {
            version: '0.2.0',
            encrypted: true,
            data: encrypted,
            timestamp: new Date().toISOString(),
        };
        return JSON.stringify(encryptedExport, null, 2);
    }
    return JSON.stringify(exportData, null, 2);
}
/**
 * Import from JSON
 */
export async function importFromJSON(json, decryptionKey) {
    const data = JSON.parse(json);
    if (data.encrypted) {
        if (!decryptionKey) {
            throw new Error('Decryption key required for encrypted export');
        }
        const plaintext = await decrypt(data.data, decryptionKey);
        const decrypted = JSON.parse(plaintext);
        return decrypted.items;
    }
    return data.items || [];
}
//# sourceMappingURL=json.js.map