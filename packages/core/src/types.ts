/**
 * Core type definitions for PassKeyPer
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
    id: string
    email: string
    /** Argon2id hash of master password (never stored locally in plain) */
    masterPasswordHash: string
    salt: string
    kdfIterations: number
    /** Private key encrypted with derived master key */
    encryptedPrivateKey: string
    publicKey: string
    mfaEnabled: boolean
    mfaSecret?: string
    createdAt: Date
    updatedAt: Date
}

export interface Session {
    userId: string
    token: string
    deviceId: string
    deviceName: string
    expiresAt: Date
    createdAt: Date
}

// ============================================================================
// Vault & Items
// ============================================================================

export interface Vault {
    id: string
    userId: string
    name: string
    type: 'personal' | 'shared' | 'work'
    /** Vault encryption key, encrypted with user's master key */
    encryptedKey: string
    icon?: string
    color?: string
    createdAt: Date
    updatedAt: Date
}

export interface VaultItem {
    id: string
    vaultId: string
    type: ItemType
    /** Encrypted JSON blob containing the actual data */
    encryptedData: string
    metadata: ItemMetadata
    version: number
    createdAt: Date
    updatedAt: Date
    lastUsedAt?: Date
}

export type ItemType =
    | 'login'
    | 'note'
    | 'card'
    | 'identity'
    | 'api_key'
    | 'ssh_key'
    | 'passkey'

export interface ItemMetadata {
    /** Encrypted name for search purposes */
    name: string
    favorite: boolean
    tags: string[]
    folderId?: string
}

// ============================================================================
// Decrypted Item Data Structures
// ============================================================================

export interface LoginItem {
    type: 'login'
    name: string
    username: string
    password: string
    urls: string[]
    totpSecret?: string
    notes?: string
    customFields: CustomField[]
    passwordHistory: PasswordHistoryEntry[]
}

export interface SecureNote {
    type: 'note'
    name: string
    content: string
    markdown: boolean
    tags: string[]
}

export interface CreditCard {
    type: 'card'
    name: string
    cardholderName: string
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    pin?: string
    brand?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other'
    notes?: string
}

export interface Identity {
    type: 'identity'
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: Address
    dateOfBirth?: string
    ssn?: string
    passportNumber?: string
    licenseNumber?: string
}

export interface ApiKey {
    type: 'api_key'
    name: string
    key: string
    url: string
    expiresAt?: Date
    notes?: string
}

export interface SshKey {
    type: 'ssh_key'
    name: string
    publicKey: string
    privateKey: string
    passphrase?: string
    fingerprint: string
}

export interface Passkey {
    type: 'passkey'
    name: string
    rpId: string
    rpName: string
    userHandle: string
    credentialId: string
    publicKey: string
    privateKey: string
    counter: number
    createdAt: Date
}

export type DecryptedItem =
    | LoginItem
    | SecureNote
    | CreditCard
    | Identity
    | ApiKey
    | SshKey
    | Passkey

// ============================================================================
// Supporting Types
// ============================================================================

export interface CustomField {
    name: string
    value: string
    type: 'text' | 'password' | 'email' | 'url' | 'number'
}

export interface PasswordHistoryEntry {
    password: string
    changedAt: Date
}

export interface Address {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
}

// ============================================================================
// Cryptography Types
// ============================================================================

export interface EncryptedBlob {
    /** Initialization vector (12 bytes for GCM) */
    iv: string
    /** Ciphertext */
    ciphertext: string
    /** Authentication tag (16 bytes for GCM) */
    tag: string
    /** Salt used for key derivation (if applicable) */
    salt?: string
}

export interface DerivedKeys {
    /** Master encryption key */
    encryptionKey: Uint8Array
    /** Master authentication key (for server verification) */
    authKey: Uint8Array
}

export interface KeyPair {
    publicKey: Uint8Array
    privateKey: Uint8Array
}

// ============================================================================
// Password Generation
// ============================================================================

export interface PasswordGeneratorOptions {
    length: number
    includeUppercase: boolean
    includeLowercase: boolean
    includeNumbers: boolean
    includeSymbols: boolean
    excludeAmbiguous: boolean
    minUppercase?: number
    minLowercase?: number
    minNumbers?: number
    minSymbols?: number
}

export interface PassphraseGeneratorOptions {
    wordCount: number
    separator: string
    capitalize: boolean
    includeNumber: boolean
}

export interface PasswordStrength {
    /** Score from 0-100 */
    score: number
    /** Estimated entropy in bits */
    entropy: number
    /** Estimated time to crack */
    crackTime: string
    /** Warnings about the password */
    warnings: string[]
    /** Suggestions to improve */
    suggestions: string[]
}

// ============================================================================
// Sharing
// ============================================================================

export interface Share {
    id: string
    itemId: string
    ownerId: string
    recipientId: string
    permission: SharePermission
    /** Item encryption key, encrypted with recipient's public key */
    encryptedItemKey: string
    createdAt: Date
    expiresAt?: Date
}

export type SharePermission = 'view' | 'use' | 'edit' | 'owner'

export interface ShareLink {
    id: string
    token: string
    itemId: string
    createdById: string
    password?: string
    maxViews?: number
    viewCount: number
    expiresAt?: Date
    createdAt: Date
}

// ============================================================================
// Security & Monitoring
// ============================================================================

export interface BreachCheck {
    email: string
    breached: boolean
    breaches: Breach[]
    lastChecked: Date
}

export interface Breach {
    name: string
    domain: string
    breachDate: Date
    addedDate: Date
    modifiedDate?: Date
    pwnCount: number
    description: string
    dataClasses: string[]
    isVerified: boolean
    isFabricated: boolean
    isSensitive: boolean
    isRetired: boolean
    logoPath?: string
}

export interface SecurityAudit {
    overallScore: number
    weakPasswords: AuditItem[]
    reusedPasswords: AuditItem[]
    oldPasswords: AuditItem[]
    missing2fa: AuditItem[]
    compromisedAccounts: AuditItem[]
}

export interface AuditItem {
    itemId: string
    itemName: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    issue: string
    recommendation: string
}

export interface LoginHistory {
    id: string
    userId: string
    deviceId: string
    deviceName: string
    ipAddress: string
    location?: string
    userAgent: string
    success: boolean
    timestamp: Date
}

// ============================================================================
// Sync & Conflict Resolution
// ============================================================================

export interface SyncChange {
    id: string
    vaultId: string
    itemId?: string
    operation: 'create' | 'update' | 'delete'
    timestamp: Date
    version: number
    data: any
}

export interface ConflictResolution {
    itemId: string
    localVersion: number
    remoteVersion: number
    strategy: 'local-wins' | 'remote-wins' | 'manual'
    resolvedData?: any
}

// ============================================================================
// Device Management
// ============================================================================

export interface Device {
    id: string
    userId: string
    name: string
    type: 'desktop' | 'mobile' | 'browser' | 'cli'
    os: string
    lastSyncAt: Date
    lastIpAddress: string
    lastLocation?: string
    trusted: boolean
    createdAt: Date
}

// ============================================================================
// Import/Export
// ============================================================================

export interface ImportResult {
    totalItems: number
    importedItems: number
    skippedItems: number
    errors: ImportError[]
}

export interface ImportError {
    row: number
    item: string
    error: string
}

export interface ExportOptions {
    vaultId?: string
    folderId?: string
    itemIds?: string[]
    format: 'json' | 'csv'
    encrypted: boolean
    password?: string
}

// ============================================================================
// WebAuthn / Passkey Types
// ============================================================================

export interface PublicKeyCredentialCreationOptionsJSON {
    challenge: string
    rp: {
        name: string
        id?: string
    }
    user: {
        id: string
        name: string
        displayName: string
    }
    pubKeyCredParams: Array<{
        type: 'public-key'
        alg: number
    }>
    authenticatorSelection?: {
        authenticatorAttachment?: 'platform' | 'cross-platform'
        requireResidentKey?: boolean
        residentKey?: 'discouraged' | 'preferred' | 'required'
        userVerification?: 'required' | 'preferred' | 'discouraged'
    }
    attestation?: 'none' | 'indirect' | 'direct' | 'enterprise'
    excludeCredentials?: Array<{
        type: 'public-key'
        id: string
        transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>
    }>
    timeout?: number
}

export interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string
    rpId?: string
    allowCredentials?: Array<{
        type: 'public-key'
        id: string
        transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>
    }>
    userVerification?: 'required' | 'preferred' | 'discouraged'
    timeout?: number
}

export interface PasskeyCredential {
    id: string
    userId: string
    credentialId: string
    publicKey: string
    signCount: number
    deviceName: string
    createdAt: Date
    lastUsedAt?: Date
}
