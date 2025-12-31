/**
 * Encryption and Decryption using AES-256-GCM
 *
 * Provides authenticated encryption for vault items
 */
import type { EncryptedBlob } from '../types';
/**
 * Encrypt data using AES-256-GCM
 *
 * @param plaintext - Data to encrypt (string or Uint8Array)
 * @param key - Encryption key (32 bytes)
 * @returns Encrypted blob with IV, ciphertext, and auth tag
 */
export declare function encrypt(plaintext: string | Uint8Array, key: Uint8Array): Promise<EncryptedBlob>;
/**
 * Decrypt data using AES-256-GCM
 *
 * @param blob - Encrypted blob from encrypt()
 * @param key - Decryption key (32 bytes)
 * @returns Decrypted plaintext (string)
 * @throws Error if authentication fails or decryption fails
 */
export declare function decrypt(blob: EncryptedBlob, key: Uint8Array): Promise<string>;
/**
 * Encrypt data with a randomly generated key
 * Useful for encrypting items before sharing
 *
 * @param plaintext - Data to encrypt
 * @returns Object with encrypted data and the generated key
 */
export declare function encryptWithRandomKey(plaintext: string | Uint8Array): Promise<{
    encrypted: EncryptedBlob;
    key: Uint8Array;
}>;
/**
 * Convert a CryptoKey to raw bytes
 *
 * @param key - CryptoKey to export
 * @returns Raw key bytes
 */
export declare function exportKey(key: CryptoKey): Promise<Uint8Array>;
/**
 * Generate a random encryption key
 *
 * @param length - Key length in bytes (default: 32 for AES-256)
 * @returns Random key
 */
export declare function generateEncryptionKey(length?: number): Uint8Array;
//# sourceMappingURL=encryption.d.ts.map