import { describe, it, expect } from 'vitest'
import {
    deriveMasterKey,
    deriveKeys,
    deriveServerHash,
    generateSalt,
    constantTimeEqual,
} from '../src/crypto/key-derivation'

describe('Key Derivation', () => {
    it('should derive master key from password and salt', async () => {
        const password = 'my-secure-password-123'
        const salt = generateSalt()

        const key = await deriveMasterKey(password, salt, 2)

        expect(key).toBeInstanceOf(Uint8Array)
        expect(key.length).toBe(32) // 256 bits
    })

    it('should derive same key for same password and salt', async () => {
        const password = 'my-secure-password-123'
        const salt = generateSalt()

        const key1 = await deriveMasterKey(password, salt, 2)
        const key2 = await deriveMasterKey(password, salt, 2)

        expect(constantTimeEqual(key1, key2)).toBe(true)
    })

    it('should derive different keys for different passwords', async () => {
        const salt = generateSalt()

        const key1 = await deriveMasterKey('password1', salt, 2)
        const key2 = await deriveMasterKey('password2', salt, 2)

        expect(constantTimeEqual(key1, key2)).toBe(false)
    })

    it('should derive different keys for different salts', async () => {
        const password = 'my-secure-password-123'

        const key1 = await deriveMasterKey(password, generateSalt(), 2)
        const key2 = await deriveMasterKey(password, generateSalt(), 2)

        expect(constantTimeEqual(key1, key2)).toBe(false)
    })

    it('should derive encryption and auth keys', () => {
        const masterKey = new Uint8Array(32).fill(1)
        const email = 'user@example.com'

        const { encryptionKey, authKey } = deriveKeys(masterKey, email)

        expect(encryptionKey).toBeInstanceOf(Uint8Array)
        expect(encryptionKey.length).toBe(32)
        expect(authKey).toBeInstanceOf(Uint8Array)
        expect(authKey.length).toBe(32)
        expect(constantTimeEqual(encryptionKey, authKey)).toBe(false)
    })

    it('should derive server hash', async () => {
        const masterKey = new Uint8Array(32).fill(1)
        const email = 'user@example.com'

        const hash = await deriveServerHash(masterKey, email)

        expect(typeof hash).toBe('string')
        expect(hash.length).toBe(64) // Hex string of 32 bytes
    })

    it('should generate random salt', () => {
        const salt1 = generateSalt()
        const salt2 = generateSalt()

        expect(salt1).toBeInstanceOf(Uint8Array)
        expect(salt1.length).toBe(32)
        expect(constantTimeEqual(salt1, salt2)).toBe(false)
    })

    it('should compare arrays in constant time', () => {
        const a = new Uint8Array([1, 2, 3, 4])
        const b = new Uint8Array([1, 2, 3, 4])
        const c = new Uint8Array([1, 2, 3, 5])

        expect(constantTimeEqual(a, b)).toBe(true)
        expect(constantTimeEqual(a, c)).toBe(false)
    })
})
