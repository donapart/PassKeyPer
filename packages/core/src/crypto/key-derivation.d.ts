/**
 * Key Derivation Functions
 *
 * Secure key derivation using Argon2id for master password hashing
 */
import type { DerivedKeys } from '../types';
/** Default Argon2id parameters (balanced security/performance) */
export declare const DEFAULT_ARGON2_PARAMS: {
    /** Memory cost in KiB (64 MB) */
    readonly m: 65536;
    /** Time cost (iterations) */
    readonly t: 3;
    /** Parallelism */
    readonly p: 4;
};
/** Conservative Argon2id parameters (higher security, slower) */
export declare const SECURE_ARGON2_PARAMS: {
    readonly m: 131072;
    readonly t: 5;
    readonly p: 4;
};
/**
 * Derive master key from password using Argon2id
 *
 * @param password - User's master password
 * @param salt - Unique salt (32 bytes)
 * @param iterations - Number of iterations (time cost)
 * @returns Master key (32 bytes)
 */
export declare function deriveMasterKey(password: string, salt: Uint8Array, iterations?: number): Promise<Uint8Array>;
/**
 * Derive encryption and authentication keys from master key using HKDF
 *
 * @param masterKey - Master key from deriveMasterKey()
 * @param email - User's email (used as additional context)
 * @returns Object with encryptionKey and authKey
 */
export declare function deriveKeys(masterKey: Uint8Array, email: string): DerivedKeys;
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
export declare function deriveServerHash(masterKey: Uint8Array, email: string): Promise<string>;
/**
 * Generate a cryptographically secure random salt
 *
 * @param length - Length in bytes (default: 32)
 * @returns Random salt
 */
export declare function generateSalt(length?: number): Uint8Array;
/**
 * Securely compare two byte arrays in constant time
 * Prevents timing attacks
 *
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays are equal
 */
export declare function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean;
/**
 * Securely wipe sensitive data from memory
 *
 * @param data - Uint8Array to wipe
 */
export declare function secureWipe(data: Uint8Array): void;
//# sourceMappingURL=key-derivation.d.ts.map