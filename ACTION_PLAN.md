# 📋 PassKeyPer - Development Action Plan

**Generated**: 2025-12-28 13:52  
**Current Status**: Phase 1 (100%), Phase 2 (80%), Phase 3 (40%)  
**Overall Progress**: 26.4% (2.11/8 phases)

---

## 🎯 IMMEDIATE PRIORITIES

### Phase 2 Completion (20% remaining → ~2-3 hours)

#### 1. Full TOTP Display Component (1 hour)

**File**: `apps/desktop/src/components/TOTPDisplay.tsx` (already exists!)

**Tasks**:

- [x] Component created ✅
- [ ] Integrate into ItemDetailModal
- [ ] Connect to @passkeyper/totp package
- [ ] Real token generation
- [ ] Live countdown timer
- [ ] Copy functionality

**Implementation**:

```typescript
// In ItemDetailModal.tsx, replace placeholder with:
import { TOTPDisplay } from './TOTPDisplay'

// Use component:
<TOTPDisplay secret={totpSecret} />
```

#### 2. Extension Native Messaging (1 hour)

**Files**:

- `apps/desktop/electron/native-messaging.ts` (already exists!)
- `apps/desktop/native-messaging-manifest.json` (already exists!)

**Tasks**:

- [ ] Install registry on Windows
- [ ] Test desktop ↔ extension communication
- [ ] Handle credential requests
- [ ] Send vault data
- [ ] Test autofill flow

**Commands**:

```bash
# Install native messaging host
npm run install-native-host

# Test communication
```

#### 3. Form Auto-Save (30 min)

**File**: `apps/extension/src/content/content.ts`

**Tasks**:

- [ ] Detect form submission
- [ ] Extract credentials
- [ ] Send to desktop app
- [ ] Prompt user to save
- [ ] Update existing items

---

### Phase 3 Progression (60% remaining → ~8-10 hours)

#### 4. Desktop Sync UI Integration (2 hours)

**Files to Create**:

- `apps/desktop/src/components/SyncStatusBar.tsx`
- `apps/desktop/src/hooks/useSync.ts`

**Tasks**:

- [ ] Add sync service to desktop app
- [ ] Create sync status indicator
- [ ] Show last sync time
- [ ] Manual sync button
- [ ] Sync progress indicator
- [ ] Error handling UI

#### 5. Conflict Resolution UI (2 hours)

**File**: `apps/desktop/src/components/ConflictModal.tsx`

**Tasks**:

- [ ] Detect conflicts
- [ ] Show conflicting versions
- [ ] Side-by-side comparison
- [ ] Resolution options (keep local, keep remote, merge)
- [ ] Apply resolution
- [ ] Re-sync after resolution

#### 6. Complete API Routes (2 hours)

**Files**:

- `services/api/src/routes/items.ts` (create)
- `services/api/src/routes/sharing.ts` (create)
- `services/api/src/routes/devices.ts` (create)

**Tasks**:

- [ ] Item CRUD endpoints
- [ ] Sharing endpoints
- [ ] Device management
- [ ] Testing with Postman/Thunder Client

#### 7. E2E Testing (2 hours)

**Setup**: Playwright

**Tasks**:

- [ ] Desktop app E2E tests
- [ ] Extension E2E tests
- [ ] API integration tests
- [ ] Sync flow tests
- [ ] Multi-device scenarios

---

## 📅 DEVELOPMENT SCHEDULE

### Week 1 (This Week)

**Goal**: Complete Phase 2

- [ ] Day 1: TOTP integration (1h)
- [ ] Day 2: Native messaging (1h)
- [ ] Day 3: Form auto-save (30min)
- [ ] Day 4: Testing & polish (30min)

**Result**: Phase 2 → 100% ✅

### Week 2

**Goal**: Progress Phase 3 to 70%

- [ ] Day 1-2: Desktop sync UI (2h)
- [ ] Day 3-4: Conflict resolution (2h)
- [ ] Day 5: API routes (2h)

**Result**: Phase 3 → 70%

### Week 3

**Goal**: Complete Phase 3

- [ ] Day 1-2: E2E testing (2h)
- [ ] Day 3: Polish & docs (1h)
- [ ] Day 4: v0.4.0 release

**Result**: Phase 3 → 100% ✅

---

## 🔨 DETAILED IMPLEMENTATION GUIDES

### Guide 1: TOTP Integration

**Step 1**: Update ItemDetailModal

```typescript
// Add import
import { TOTPDisplay } from './TOTPDisplay'
import { generateTOTP } from '@passkeyper/totp'

// Add state
const [totpToken, setTotpToken] = useState<string>('')

// Find TOTP field
const totpField = item.customFields?.find(
  f => f.name.toLowerCase().includes('totp')
)

// Generate token
useEffect(() => {
  if (totpField?.value) {
    const token = generateTOTP(totpField.value)
    setTotpToken(token)
  }
}, [totpField])

// Replace placeholder with
<TOTPDisplay secret={totpField.value} />
```

**Step 2**: Test

- Add TOTP field to an item
- View item detail
- Verify token generation
- Test copy functionality

**Time**: 1 hour

---

### Guide 2: Native Messaging Setup

**Step 1**: Install Host (Windows)

```powershell
# Create registry entries
$manifest = "d:\PassKeyPer\apps\desktop\native-messaging-manifest.json"
$key = "HKCU:\Software\Mozilla\NativeMessagingHosts\com.passkeyper.native"
New-Item -Path $key -Force
Set-ItemProperty -Path $key -Name "(Default)" -Value $manifest

# For Chrome
$keyChrome = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.passkeyper.native"
New-Item -Path $keyChrome -Force
Set-ItemProperty -Path $keyChrome -Name "(Default)" -Value $manifest
```

**Step 2**: Test Connection

```javascript
// In extension background.js
const port = chrome.runtime.connectNative('com.passkeyper.native')
port.onMessage.addListener(message => {
  console.log('Received:', message)
})
port.postMessage({ type: 'ping' })
```

**Time**: 1 hour

---

### Guide 3: Sync UI Integration

**Step 1**: Create SyncStatusBar Component

```typescript
// apps/desktop/src/components/SyncStatusBar.tsx
export function SyncStatusBar() {
  const { syncStatus, lastSync, sync } = useSync()
  
  return (
    <div className="sync-status-bar">
      {syncStatus === 'syncing' && <Spinner />}
      {lastSync && <span>Last sync: {formatTime(lastSync)}</span>}
      <button onClick={sync}>Sync Now</button>
    </div>
  )
}
```

**Step 2**: Create useSync Hook

```typescript
// apps/desktop/src/hooks/useSync.ts
export function useSync() {
  const [syncService] = useState(() => createSyncService({
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000/ws',
    token: localStorage.getItem('token'),
    deviceId: getDeviceId()
  }))
  
  useEffect(() => {
    syncService.initialize()
    syncService.on('sync-complete', handleSyncComplete)
    return () => syncService.disconnect()
  }, [])
  
  return {
    sync: () => syncService.sync(vaultId),
    syncStatus: syncService.getStatus()
  }
}
```

**Step 3**: Integrate into App

```typescript
// In App.tsx
import { SyncStatusBar } from './components/SyncStatusBar'

// Add to UI
<SyncStatusBar />
```

**Time**: 2 hours

---

## 📊 PROGRESS TRACKING

### Current State

```
Phase 1: ██████████ 100% ✅
Phase 2: ████████░░  80%
Phase 3: ████░░░░░░  40%

Overall: ████░░░░░░░░░░░░ 26.4%
```

### After Week 1

```
Phase 1: ██████████ 100% ✅
Phase 2: ██████████ 100% ✅
Phase 3: ████░░░░░░  40%

Overall: ████░░░░░░░░░░░░ 30%
```

### After Week 2

```
Phase 1: ██████████ 100% ✅
Phase 2: ██████████ 100% ✅
Phase 3: ███████░░░  70%

Overall: █████░░░░░░░░░░░ 35%
```

### After Week 3

```
Phase 1: ██████████ 100% ✅
Phase 2: ██████████ 100% ✅
Phase 3: ██████████ 100% ✅

Overall: ██████░░░░░░░░░░ 40%
```

---

## ✅ COMPLETION CHECKLIST

### Phase 2 (Complete by Week 1)

- [ ] Full TOTP Display integrated
- [ ] Native messaging working
- [ ] Form auto-save functional
- [ ] Cross-browser testing done
- [ ] Documentation updated
- [ ] v0.3.5 tag created

### Phase 3 (Complete by Week 3)

- [ ] Sync UI components done
- [ ] Conflict resolution working
- [ ] All API routes complete
- [ ] E2E tests passing
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] v0.4.0 tag created

---

## 🎯 SUCCESS METRICS

### Phase 2 Success

- ✅ TOTP tokens generating correctly
- ✅ Extension connects to desktop
- ✅ Forms auto-save credentials
- ✅ No critical bugs

### Phase 3 Success

- ✅ Items sync in real-time
- ✅ Conflicts resolve correctly
- ✅ Multi-device works
- ✅ No data loss
- ✅ Fast sync (<2s)

---

## 📝 NEXT SESSION PLAN

### Session 6: Phase 2 Completion

**Duration**: 2-3 hours  
**Goals**:

1. Integrate TOTP component
2. Test native messaging
3. Implement form auto-save
4. Update documentation
5. Tag v0.3.5

### Session 7-8: Phase 3 Progress

**Duration**: 6-8 hours  
**Goals**:

1. Build sync UI
2. Create conflict resolution
3. Complete API routes
4. Write E2E tests
5. Tag v0.4.0

---

## 🚀 READY TO START?

**Quick Start Commands**:

```bash
# Start desktop app
cd apps/desktop
npm run electron:dev

# Start API server
cd services/api
npm run dev

# Build extension
cd apps/extension
npm run build

# Run tests
npm test
```

**Choose Your Path**:

1. **TOTP First** - Most visible feature
2. **Native Messaging** - Unlock extension features
3. **Sync UI** - Enable cloud features

---

**Status**: 🟢 READY FOR DEVELOPMENT!  
**Next**: Choose a task and start building! 🔨
