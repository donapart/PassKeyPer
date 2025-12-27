# PassKeyPer - Technical Architecture

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Desktop  │  │  Mobile  │  │ Browser  │  │   CLI    │   │
│  │   App    │  │   App    │  │Extension │  │   Tool   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └──────────────┴─────────────┴─────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │    Client-Side Encryption    │
        │      (Zero-Knowledge)        │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │       API Gateway            │
        │   (Authentication/Routing)   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
┌───────────────┐            ┌─────────────────┐
│  Vault Service│            │  Sync Service   │
└───────┬───────┘            └────────┬────────┘
        │                             │
        ▼                             ▼
┌────────────────────────────────────────────┐
│         Database (PostgreSQL)              │
│      (Encrypted blobs only)                │
└────────────────────────────────────────────┘
```

## Technology Stack

### Frontend/Desktop

- **Framework**: Electron or Tauri
- **UI**: React with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **Styling**: TailwindCSS + Headless UI
- **Forms**: React Hook Form + Zod validation

### Mobile

- **Framework**: React Native or Flutter
- **Platform APIs**:
  - iOS: AuthenticationServices, LocalAuthentication
  - Android: BiometricPrompt, AutofillService

### Browser Extension

- **API**: Manifest V3 (WebExtensions)
- **Communication**: Native messaging protocol
- **Storage**: chrome.storage.local (encrypted)

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS or Fastify
- **Database**: PostgreSQL (primary), Redis (cache/sessions)
- **Queue**: BullMQ for async jobs
- **WebSocket**: Socket.io for real-time sync

### CLI

- **Framework**: oclif (TypeScript)
- **Output**: JSON/YAML/Table formats
- **Configuration**: Cosmiconfig

### Cryptography

- **Library**: Node.js crypto module + libsodium
- **Key Derivation**: Argon2id (via @noble/hashes)
- **Encryption**: AES-256-GCM, ChaCha20-Poly1305
- **Asymmetric**: Ed25519, X25519

## Data Models

### User

```typescript
interface User {
  id: string
  email: string
  masterPasswordHash: string // Argon2id hash
  salt: string
  kdfIterations: number
  encryptedPrivateKey: string
  publicKey: string
  mfaEnabled: boolean
  mfaSecret?: string // Encrypted
  createdAt: Date
  updatedAt: Date
}
```

### Vault

```typescript
interface Vault {
  id: string
  userId: string
  name: string
  type: 'personal' | 'shared' | 'work'
  encryptedKey: string // Vault encryption key, encrypted with user's key
  createdAt: Date
  updatedAt: Date
}
```

### VaultItem

```typescript
interface VaultItem {
  id: string
  vaultId: string
  type: 'login' | 'note' | 'card' | 'identity' | 'api_key' | 'ssh_key'
  encryptedData: string // JSON blob, encrypted with vault key
  metadata: {
    name: string // Searchable, encrypted separately
    favorite: boolean
    tags: string[]
    folderId?: string
  }
  version: number
  createdAt: Date
  updatedAt: Date
  lastUsedAt?: Date
}
```

### EncryptedData (Decrypted Structure)

```typescript
interface LoginItem {
  type: 'login'
  username: string
  password: string
  urls: string[]
  totpSecret?: string
  notes?: string
  customFields: Array<{
    name: string
    value: string
    type: 'text' | 'password' | 'email' | 'url'
  }>
  passwordHistory: Array<{
    password: string
    changedAt: Date
  }>
}
```

## Encryption Flow

### Account Creation

1. User enters email + master password
2. Generate salt (32 bytes random)
3. Derive key from master password: `masterKey = Argon2id(password, salt, iterations)`
4. Generate encryption key: `encryptionKey = HKDF(masterKey, "encryption")`
5. Generate authentication key: `authKey = HKDF(masterKey, "authentication")`
6. Hash master password for server: `serverHash = Argon2id(masterKey, email, 1)`
7. Generate Ed25519 keypair for sharing
8. Encrypt private key with encryptionKey
9. Send to server: `{ email, serverHash, salt, iterations, encryptedPrivateKey, publicKey }`

### Login

1. User enters email + master password
2. Fetch salt and iterations from server
3. Derive masterKey locally (same as creation)
4. Derive serverHash and send to server
5. Server validates hash, returns session token
6. Decrypt private key with encryptionKey
7. Load vaults (encrypted) and decrypt vault keys

### Creating Vault Item

1. User fills form (e.g., login credentials)
2. Serialize data to JSON
3. Generate random IV (12 bytes for GCM)
4. Encrypt: `ciphertext = AES-256-GCM(vaultKey, IV, plaintext)`
5. Store: `{ encryptedData: IV + ciphertext + authTag }`

### Sharing Item

1. Fetch recipient's public key
2. Generate ephemeral item encryption key
3. Encrypt item with item key
4. Encrypt item key with recipient's public key (X25519 + ChaCha20-Poly1305)
5. Store shared item with encrypted key per recipient

## API Endpoints

### Authentication

- `POST /auth/register` - Create account
- `POST /auth/login` - Login with master password
- `POST /auth/mfa/verify` - Verify TOTP/FIDO2
- `POST /auth/logout` - Invalidate session
- `POST /auth/refresh` - Refresh session token

### Vault Management

- `GET /vaults` - List user's vaults
- `POST /vaults` - Create new vault
- `GET /vaults/:id/items` - List items in vault
- `POST /vaults/:id/items` - Create item
- `PUT /vaults/:id/items/:itemId` - Update item
- `DELETE /vaults/:id/items/:itemId` - Delete item

### Sync

- `WS /sync` - WebSocket for real-time sync
- `POST /sync/pull` - Pull changes since timestamp
- `POST /sync/push` - Push local changes

### Sharing

- `POST /share/item/:id` - Share item with user
- `DELETE /share/item/:id/recipient/:userId` - Revoke share
- `POST /share/link` - Create share link
- `GET /share/link/:token` - Access shared item

### Security

- `GET /security/breaches` - Check for breaches (HIBP)
- `POST /security/audit` - Get security audit report
- `GET /security/devices` - List authorized devices
- `DELETE /security/devices/:id` - Remove device

## Security Considerations

### Threat Model

- **Compromised server**: Data remains encrypted (zero-knowledge)
- **Network interception**: TLS protects in transit
- **Client-side attack**: Memory protection, auto-lock
- **Phishing**: Domain validation, visual warnings
- **Brute force**: Rate limiting, account lockout, Argon2id

### Defense Mechanisms

- **Rate limiting**: Max 5 login attempts per IP per hour
- **CORS**: Strict origin policies
- **CSP**: Content Security Policy headers
- **SRI**: Subresource Integrity for CDN assets
- **Certificate pinning**: Mobile apps pin server cert
- **Code signing**: Desktop/mobile apps signed

## Deployment Architecture

### Docker Services

```yaml
services:
  api:
    image: passkeyper/api:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
  
  sync:
    image: passkeyper/sync:latest
    environment:
      - REDIS_URL=redis://...
  
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
```

### Infrastructure

- **CDN**: CloudFlare for static assets
- **Load Balancer**: Nginx or Traefik
- **Database**: PostgreSQL with replication
- **Cache**: Redis cluster
- **Storage**: S3-compatible for attachments
- **Monitoring**: Prometheus + Grafana
- **Logging**: Loki or ELK stack

## Performance Targets

- **Encryption/Decryption**: < 100ms for typical item
- **Sync latency**: < 500ms for real-time updates
- **Login time**: < 2 seconds (with fast internet)
- **Search**: < 50ms for 1000+ items (local)
- **API response time**: p95 < 200ms
- **Availability**: 99.9% uptime

## Development Workflow

### Project Structure

```
passkeyper/
├── apps/
│   ├── desktop/          # Electron/Tauri app
│   ├── mobile/           # React Native/Flutter
│   ├── extension/        # Browser extension
│   ├── cli/              # CLI tool
│   └── web/              # Web dashboard
├── packages/
│   ├── core/             # Shared crypto/types
│   ├── api-client/       # API client SDK
│   └── ui-components/    # Shared UI components
├── services/
│   ├── api/              # REST API
│   ├── sync/             # WebSocket sync service
│   └── worker/           # Background jobs
└── docs/                 # Documentation
```

### CI/CD Pipeline

1. **Lint & Test**: ESLint, Prettier, Jest
2. **Type Check**: TypeScript strict mode
3. **Security Scan**: npm audit, Snyk
4. **Build**: Multi-platform builds
5. **E2E Tests**: Playwright
6. **Deploy**:
   - Staging on every merge to main
   - Production on git tag
7. **Release**: Automated changelog, GitHub releases
