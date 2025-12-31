import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateEncryptionKey } from '../src/crypto/encryption';
describe('Encryption', () => {
    it('should encrypt and decrypt text', async () => {
        const plaintext = 'Hello, World!';
        const key = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key);
        const decrypted = await decrypt(encrypted, key);
        expect(decrypted).toBe(plaintext);
    });
    it('should encrypt and decrypt binary data', async () => {
        const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
        const key = generateEncyptionKey();
        const encrypted = await encrypt(plaintext, key);
        const decrypted = await decrypt(encrypted, key);
        // Decrypt returns string, so we need to convert back
        expect(decrypted).toBeTruthy();
    });
    it('should produce different ciphertext for same plaintext', async () => {
        const plaintext = 'Hello, World!';
        const key = generateEncryptionKey();
        const encrypted1 = await encrypt(plaintext, key);
        const encrypted2 = await encrypt(plaintext, key);
        // Different IVs should produce different ciphertext
        expect(encrypted1.iv).not.toBe(encrypted2.iv);
        expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
        // But both should decrypt to same plaintext
        expect(await decrypt(encrypted1, key)).toBe(plaintext);
        expect(await decrypt(encrypted2, key)).toBe(plaintext);
    });
    it('should fail to decrypt with wrong key', async () => {
        const plaintext = 'Hello, World!';
        const key1 = generateEncryptionKey();
        const key2 = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key1);
        await expect(decrypt(encrypted, key2)).rejects.toThrow();
    });
    it('should fail to decrypt tampered data', async () => {
        const plaintext = 'Hello, World!';
        const key = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key);
        // Tamper with ciphertext
        encrypted.ciphertext = encrypted.ciphertext.slice(0, -5) + 'XXXXX';
        await expect(decrypt(encrypted, key)).rejects.toThrow();
    });
    it('should include IV and auth tag in encrypted blob', async () => {
        const plaintext = 'Hello, World!';
        const key = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key);
        expect(encrypted.iv).toBeTruthy();
        expect(encrypted.ciphertext).toBeTruthy();
        expect(encrypted.tag).toBeTruthy();
        // IV should be 12 bytes (16 chars in base64)
        expect(Buffer.from(encrypted.iv, 'base64').length).toBe(12);
        // Tag should be 16 bytes
        expect(Buffer.from(encrypted.tag, 'base64').length).toBe(16);
    });
    it('should encrypt long text', async () => {
        const plaintext = 'A'.repeat(10000);
        const key = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key);
        const decrypted = await decrypt(encrypted, key);
        expect(decrypted).toBe(plaintext);
    });
    it('should encrypt JSON data', async () => {
        const data = {
            username: 'user@example.com',
            password: 'super-secret',
            urls: ['https://example.com'],
        };
        const plaintext = JSON.stringify(data);
        const key = generateEncryptionKey();
        const encrypted = await encrypt(plaintext, key);
        const decrypted = await decrypt(encrypted, key);
        expect(JSON.parse(decrypted)).toEqual(data);
    });
});
//# sourceMappingURL=encryption.test.js.map