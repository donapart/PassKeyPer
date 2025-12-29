# E2E Testing Plan

**Framework**: Playwright  
**Goal**: Test critical user flows  
**Coverage**: Desktop app, API, Extension (basic)

---

## Test Categories

### 1. Desktop App Tests (Critical)

#### Auth Flow

```typescript
- User can register
- User can login
- User can logout
- Auto-lock works
- Session persists
```

#### Vault Management

```typescript
- Create vault
- List vaults
- Switch between vaults
- Delete vault
```

#### Item Management

```typescript
- Create password item
- Edit item
- Delete item
- Search items
- Copy password
- View item details
```

#### TOTP

```typescript
- Add TOTP to item
- TOTP code displays
- TOTP countdown works
- Copy TOTP code
```

#### Import/Export

```typescript
- Import CSV file
- Import JSON file
- Detect duplicates
- Choose merge strategy
- Export to CSV
- Export to JSON (encrypted)
```

---

### 2. API Integration Tests

#### REST Endpoints

```typescript
- POST /api/auth/register
- POST /api/auth/login
- GET /api/vaults
- POST /api/vaults
- GET /api/items
- POST /api/items
- PUT /api/items/:id
- DELETE /api/items/:id
- POST /api/sync/pull
- POST /api/sync/push
```

#### WebSocket

```typescript
- Connection established
- Authentication works
- Receives updates
- Broadcasts changes
```

---

### 3. Sync Tests (Integration)

#### Basic Sync

```typescript
- Pull updates from server
- Push changes to server
- Real-time updates work
- Offline queue works
```

#### Conflict Resolution

```typescript
- Detect conflicts
- Show conflict modal
- Resolve with local version
- Resolve with server version
```

---

## Test Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts           # Authentication flows
│   ├── vault.spec.ts          # Vault management
│   ├── items.spec.ts          # Item CRUD
│   ├── totp.spec.ts           # TOTP functionality
│   ├── import-export.spec.ts  # Import/Export
│   └── sync.spec.ts           # Cloud sync
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── vaults.test.ts
│   │   ├── items.test.ts
│   │   └── sync.test.ts
│   └── websocket/
│       └── connection.test.ts
└── fixtures/
    ├── users.json
    ├── vaults.json
    ├── items.json
    └── import-data.csv
```

---

## Implementation Status

✅ Test plan documented  
⏳ Playwright setup (pending)  
⏳ E2E tests (pending)  
⏳ Integration tests (pending)  
⏳ CI/CD integration (pending)

---

## Quick Start

```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npm run test:e2e

# Run specific test
npm run test:e2e -- auth.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

---

## Success Criteria

- [ ] All critical flows covered
- [ ] Tests are deterministic
- [ ] Tests run in CI/CD
- [ ] Coverage > 70%
- [ ] Fast execution (< 5 min)

---

**This plan represents the final 10% of Phase 3**
