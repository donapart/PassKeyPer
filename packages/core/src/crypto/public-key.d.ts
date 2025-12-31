/**
 * Public Key Cryptography for Sharing
 *
 * Uses Ed25519 for signing and X25519 for encryption (libsodium)
 */
import type { KeyPair } from '../types';
/** Initialize libsodium (must be called before using crypto functions) */
export declare function init(): Promise<void>;
/**
 * Generate an Ed25519 keypair for signing/encryption
 *
 * @returns Public and private key pair
 */
export declare function generateKeyPair(): Promise<KeyPair>;
/**
 * Encrypt data using public key cryptography (sealed box)
 * Only the recipient can decrypt with their private key
 *
 * @param plaintext - Data to encrypt
 * @param recipientPublicKey - Recipient's public key
 * @returns Encrypted data
 */
export declare function encryptForRecipient(plaintext: string | Uint8Array, recipientPublicKey: Uint8Array): Promise<Uint8Array>;
/**
 * Decrypt data encrypted with encryptForRecipient()
 *
 * @param encrypted - Encrypted data
 * @param recipientPublicKey - Recipient's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted plaintext
 */
export declare function decryptFromSender(encrypted: Uint8Array, recipientPublicKey: Uint8Array, recipientPrivateKey: Uint8Array): Promise<string>;
/**
 * Encrypt data for a specific sender and recipient
 * Both parties can decrypt
 *
 * @param plaintext - Data to encrypt
 * @param nonce - Unique nonce (24 bytes)
 * @param recipientPublicKey - Recipient's public key
 * @param senderPrivateKey - Sender's private key
 * @returns Encrypted data
 */
export declare function encryptAuthenticated(plaintext: string | Uint8Array, nonce: Uint8Array, recipientPublicKey: Uint8Array, senderPrivateKey: Uint8Array): Promise<Uint8Array>;
/**
 * Decrypt authenticated encrypted data
 *
 * @param encrypted - Encrypted data
 * @param nonce - Nonce used for encryption
 * @param senderPublicKey - Sender's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted plaintext
 */
export declare function decryptAuthenticated(encrypted: Uint8Array, nonce: Uint8Array, senderPublicKey: Uint8Array, recipientPrivateKey: Uint8Array): Promise<string>;
/**
 * Generate a random nonce for authenticated encryption
 *
 * @returns Random 24-byte nonce
 */
export declare function generateNonce(): Promise<Uint8Array>;
/**
 * Encrypt a symmetric key with recipient's public key
 * Used for sharing vault items
 *
 * @param symmetricKey - AES key to share
 * @param recipientPublicKey - Recipient's public key
 * @returns Encrypted key
 */
export declare function encryptKey(symmetricKey: Uint8Array, recipientPublicKey: Uint8Array): Promise<Uint8Array>;
/**
 * Decrypt a symmetric key
 *
 * @param encryptedKey - Encrypted symmetric key
 * @param recipientPublicKey - Recipient's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted symmetric key
 */
export declare function decryptKey(encryptedKey: Uint8Array, recipientPublicKey: Uint8Array, recipientPrivateKey: Uint8Array): Promise<Uint8Array>;
//# sourceMappingURL=public-key.d.ts.map