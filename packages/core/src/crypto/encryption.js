/**
 * Encryption and Decryption using AES-256-GCM
 *
 * Provides authenticated encryption for vault items
 */
/**
 * Encrypt data using AES-256-GCM
 *
 * @param plaintext - Data to encrypt (string or Uint8Array)
 * @param key - Encryption key (32 bytes)
 * @returns Encrypted blob with IV, ciphertext, and auth tag
 */
export async function encrypt(plaintext, key) {
    // Generate random IV (12 bytes for GCM)
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    // Convert plaintext to bytes if string
    const plaintextBytes = typeof plaintext === 'string'
        ? new TextEncoder().encode(plaintext)
        : plaintext;
    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt']);
    // Encrypt
    const ciphertextWithTag = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128, // 16 bytes auth tag
    }, cryptoKey, plaintextBytes);
    // Split ciphertext and tag
    const ciphertextArray = new Uint8Array(ciphertextWithTag);
    const ciphertext = ciphertextArray.slice(0, -16);
    const tag = ciphertextArray.slice(-16);
    return {
        iv: Buffer.from(iv).toString('base64'),
        ciphertext: Buffer.from(ciphertext).toString('base64'),
        tag: Buffer.from(tag).toString('base64'),
    };
}
/**
 * Decrypt data using AES-256-GCM
 *
 * @param blob - Encrypted blob from encrypt()
 * @param key - Decryption key (32 bytes)
 * @returns Decrypted plaintext (string)
 * @throws Error if authentication fails or decryption fails
 */
export async function decrypt(blob, key) {
    // Decode from base64
    const iv = Buffer.from(blob.iv, 'base64');
    const ciphertext = Buffer.from(blob.ciphertext, 'base64');
    const tag = Buffer.from(blob.tag, 'base64');
    // Concatenate ciphertext and tag
    const ciphertextWithTag = new Uint8Array([...ciphertext, ...tag]);
    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt']);
    try {
        // Decrypt and verify auth tag
        const plaintextBuffer = await crypto.subtle.decrypt({
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
        }, cryptoKey, ciphertextWithTag);
        return new TextDecoder().decode(plaintextBuffer);
    }
    catch (error) {
        throw new Error('Decryption failed: Invalid key or corrupted data');
    }
}
/**
 * Encrypt data with a randomly generated key
 * Useful for encrypting items before sharing
 *
 * @param plaintext - Data to encrypt
 * @returns Object with encrypted data and the generated key
 */
export async function encryptWithRandomKey(plaintext) {
    const key = new Uint8Array(32);
    crypto.getRandomValues(key);
    const encrypted = await encrypt(plaintext, key);
    return { encrypted, key };
}
/**
 * Convert a CryptoKey to raw bytes
 *
 * @param key - CryptoKey to export
 * @returns Raw key bytes
 */
export async function exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exported);
}
/**
 * Generate a random encryption key
 *
 * @param length - Key length in bytes (default: 32 for AES-256)
 * @returns Random key
 */
export function generateEncryptionKey(length = 32) {
    const key = new Uint8Array(length);
    crypto.getRandomValues(key);
    return key;
}
//# sourceMappingURL=encryption.js.map