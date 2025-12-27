/**
 * Public Key Cryptography for Sharing
 * 
 * Uses Ed25519 for signing and X25519 for encryption (libsodium)
 */

import sodium from 'libsodium-wrappers'
import type { KeyPair } from '../types'

/** Initialize libsodium (must be called before using crypto functions) */
export async function init(): Promise<void> {
    await sodium.ready
}

/**
 * Generate an Ed25519 keypair for signing/encryption
 * 
 * @returns Public and private key pair
 */
export async function generateKeyPair(): Promise<KeyPair> {
    await init()

    const keypair = sodium.crypto_box_keypair()

    return {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
    }
}

/**
 * Encrypt data using public key cryptography (sealed box)
 * Only the recipient can decrypt with their private key
 * 
 * @param plaintext - Data to encrypt
 * @param recipientPublicKey - Recipient's public key
 * @returns Encrypted data
 */
export async function encryptForRecipient(
    plaintext: string | Uint8Array,
    recipientPublicKey: Uint8Array
): Promise<Uint8Array> {
    await init()

    const message =
        typeof plaintext === 'string'
            ? sodium.from_string(plaintext)
            : plaintext

    const encrypted = sodium.crypto_box_seal(message, recipientPublicKey)

    return encrypted
}

/**
 * Decrypt data encrypted with encryptForRecipient()
 * 
 * @param encrypted - Encrypted data
 * @param recipientPublicKey - Recipient's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted plaintext
 */
export async function decryptFromSender(
    encrypted: Uint8Array,
    recipientPublicKey: Uint8Array,
    recipientPrivateKey: Uint8Array
): Promise<string> {
    await init()

    const decrypted = sodium.crypto_box_seal_open(
        encrypted,
        recipientPublicKey,
        recipientPrivateKey
    )

    return sodium.to_string(decrypted)
}

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
export async function encryptAuthenticated(
    plaintext: string | Uint8Array,
    nonce: Uint8Array,
    recipientPublicKey: Uint8Array,
    senderPrivateKey: Uint8Array
): Promise<Uint8Array> {
    await init()

    const message =
        typeof plaintext === 'string'
            ? sodium.from_string(plaintext)
            : plaintext

    const encrypted = sodium.crypto_box_easy(
        message,
        nonce,
        recipientPublicKey,
        senderPrivateKey
    )

    return encrypted
}

/**
 * Decrypt authenticated encrypted data
 * 
 * @param encrypted - Encrypted data
 * @param nonce - Nonce used for encryption
 * @param senderPublicKey - Sender's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted plaintext
 */
export async function decryptAuthenticated(
    encrypted: Uint8Array,
    nonce: Uint8Array,
    senderPublicKey: Uint8Array,
    recipientPrivateKey: Uint8Array
): Promise<string> {
    await init()

    const decrypted = sodium.crypto_box_open_easy(
        encrypted,
        nonce,
        senderPublicKey,
        recipientPrivateKey
    )

    return sodium.to_string(decrypted)
}

/**
 * Generate a random nonce for authenticated encryption
 * 
 * @returns Random 24-byte nonce
 */
export async function generateNonce(): Promise<Uint8Array> {
    await init()
    return sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
}

/**
 * Encrypt a symmetric key with recipient's public key
 * Used for sharing vault items
 * 
 * @param symmetricKey - AES key to share
 * @param recipientPublicKey - Recipient's public key
 * @returns Encrypted key
 */
export async function encryptKey(
    symmetricKey: Uint8Array,
    recipientPublicKey: Uint8Array
): Promise<Uint8Array> {
    return encryptForRecipient(symmetricKey, recipientPublicKey)
}

/**
 * Decrypt a symmetric key
 * 
 * @param encryptedKey - Encrypted symmetric key
 * @param recipientPublicKey - Recipient's public key
 * @param recipientPrivateKey - Recipient's private key
 * @returns Decrypted symmetric key
 */
export async function decryptKey(
    encryptedKey: Uint8Array,
    recipientPublicKey: Uint8Array,
    recipientPrivateKey: Uint8Array
): Promise<Uint8Array> {
    const decrypted = await decryptFromSender(
        encryptedKey,
        recipientPublicKey,
        recipientPrivateKey
    )

    // Convert back to Uint8Array
    return Buffer.from(decrypted, 'base64')
}
