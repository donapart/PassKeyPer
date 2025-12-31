/**
 * @passkeyper/core
 * 
 * Core cryptography and types for PassKeyPer password manager
 */

// Export types
export * from './types'

// Export cryptography functions
export {
    deriveMasterKey,
    deriveKeys,
    deriveServerHash,
    generateSalt,
    constantTimeEqual,
    secureWipe,
    DEFAULT_ARGON2_PARAMS,
    SECURE_ARGON2_PARAMS,
} from './crypto/key-derivation'

export {
    encrypt,
    decrypt,
    encryptWithRandomKey,
    exportKey,
    generateEncryptionKey,
} from './crypto/encryption'

export {
    generatePassword,
    generatePassphrase,
    calculateStrength,
    isCommonPassword,
} from './crypto/password-generator'

export {
    init as initCrypto,
    generateKeyPair,
    encryptForRecipient,
    decryptFromSender,
    encryptAuthenticated,
    decryptAuthenticated,
    generateNonce,
    encryptKey,
    decryptKey,
} from './crypto/public-key'

// WebAuthn / Passkey support
export {
    isWebAuthnAvailable,
    isPlatformAuthenticatorAvailable,
    isConditionalMediationAvailable,
    registerPasskey,
    authenticateWithPasskey,
    abortWebAuthn,
    createPasskeyOptions,
} from './crypto/webauthn'
