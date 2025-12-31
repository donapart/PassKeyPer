/**
 * Key Derivation Functions
 *
 * Secure key derivation using Argon2id for master password hashing
 */
import { argon2id } from '@noble/hashes/argon2';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
/** Default Argon2id parameters (balanced security/performance) */
export const DEFAULT_ARGON2_PARAMS = {
    /** Memory cost in KiB (64 MB) */
    m: 65536,
    /** Time cost (iterations) */
    t: 3,
    /** Parallelism */
    p: 4,
};
/** Conservative Argon2id parameters (higher security, slower) */
export const SECURE_ARGON2_PARAMS = {
    m: 131072, // 128 MB
    t: 5,
    p: 4,
};
/**
 * Derive master key from password using Argon2id
 *
 * @param password - User's master password
 * @param salt - Unique salt (32 bytes)
 * @param iterations - Number of iterations (time cost)
 * @returns Master key (32 bytes)
 */
export async function deriveMasterKey(password, salt, iterations = DEFAULT_ARGON2_PARAMS.t) {
    const passwordBytes = new TextEncoder().encode(password);
    const key = argon2id(passwordBytes, salt, {
        t: iterations,
        m: DEFAULT_ARGON2_PARAMS.m,
        p: DEFAULT_ARGON2_PARAMS.p,
        dkLen: 32, // Output 32 bytes (256 bits)
    });
    // Securely wipe password from memory
    passwordBytes.fill(0);
    return key;
}
/**
 * Derive encryption and authentication keys from master key using HKDF
 *
 * @param masterKey - Master key from deriveMasterKey()
 * @param email - User's email (used as additional context)
 * @returns Object with encryptionKey and authKey
 */
export function deriveKeys(masterKey, email) {
    const info = new TextEncoder().encode(email);
    // Derive 64 bytes total: 32 for encryption, 32 for authentication
    const derivedKey = hkdf(sha256, masterKey, undefined, info, 64);
    return {
        encryptionKey: derivedKey.slice(0, 32),
        authKey: derivedKey.slice(32, 64),
    };
}
/**
 * Derive server authentication hash from master key
 *
 * This hash is sent to the server for authentication.
 * Server never sees the master password or encryption keys.
 *
 * @param masterKey - Master key
 * @param email - User's email
 * @returns Server authentication hash (hex string)
 */
export async function deriveServerHash(masterKey, email) {
    const salt = new TextEncoder().encode(email);
    // Use Argon2id again but with minimal iterations (server will check this)
    const serverHash = argon2id(masterKey, salt, {
        t: 1,
        m: 16384, // 16 MB (lower for server verification)
        p: 1,
        dkLen: 32,
    });
    return Buffer.from(serverHash).toString('hex');
}
/**
 * Generate a cryptographically secure random salt
 *
 * @param length - Length in bytes (default: 32)
 * @returns Random salt
 */
export function generateSalt(length = 32) {
    const salt = new Uint8Array(length);
    crypto.getRandomValues(salt);
    return salt;
}
/**
 * Securely compare two byte arrays in constant time
 * Prevents timing attacks
 *
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays are equal
 */
export function constantTimeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}
/**
 * Securely wipe sensitive data from memory
 *
 * @param data - Uint8Array to wipe
 */
export function secureWipe(data) {
    data.fill(0);
}
//# sourceMappingURL=key-derivation.js.map