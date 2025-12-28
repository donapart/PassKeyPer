/**
 * JSON Export/Import with encryption
 */

import { encrypt, decrypt } from '@passkeyper/core'
import type { VaultItem } from '@passkeyper/core'

export interface EncryptedExport {
    version: string
    encrypted: true
    data: {
        iv: string
        ciphertext: string
        tag: string
    }
    timestamp: string
}

export interface PlainExport {
    version: string
    encrypted: false
    items: VaultItem[]
    timestamp: string
}

/**
 * Export to encrypted JSON
 */
export async function exportToJSON(
    items: VaultItem[],
    encryptionKey?: Uint8Array
): Promise<string> {
    const exportData: PlainExport = {
        version: '0.2.0',
        encrypted: false,
        items,
        timestamp: new Date().toISOString(),
    }

    if (encryptionKey) {
        const plaintext = JSON.stringify(exportData)
        const encrypted = await encrypt(plaintext, encryptionKey)

        const encryptedExport: EncryptedExport = {
            version: '0.2.0',
            encrypted: true,
            data: encrypted,
            timestamp: new Date().toISOString(),
        }

        return JSON.stringify(encryptedExport, null, 2)
    }

    return JSON.stringify(exportData, null, 2)
}

/**
 * Import from JSON
 */
export async function importFromJSON(
    json: string,
    decryptionKey?: Uint8Array
): Promise<VaultItem[]> {
    const data = JSON.parse(json)

    if (data.encrypted) {
        if (!decryptionKey) {
            throw new Error('Decryption key required for encrypted export')
        }

        const plaintext = await decrypt(data.data, decryptionKey)
        const decrypted = JSON.parse(plaintext) as PlainExport
        return decrypted.items
    }

    return data.items || []
}
