# 📱 Phase 4: Mobile Apps - Implementation Plan

**Goal**: Build iOS & Android apps with React Native  
**Scope**: Mobile password manager with biometric auth  
**Timeline**: ~12-16 hours  
**Target**: Phase 4: 100%  

---

## 🎯 ROADMAP

### Priority 1: React Native Setup (2h)

**Tasks**:

1. Initialize React Native project
2. Setup folder structure
3. Configure TypeScript
4. Install dependencies
5. Setup navigation (React Navigation)
6. Configure metro bundler

**Output**: Working RN app skeleton

---

### Priority 2: Shared Core Logic (2h)

**Tasks**:

1. Reuse `@passkeyper/core` (encryption)
2. Reuse `@passkeyper/totp` (2FA)
3. Create mobile storage layer
4. Adapt for React Native
5. Setup async storage

**Output**: Core functionality mobile-ready

---

### Priority 3: Biometric Authentication (2h)

**Tasks**:

1. Install expo-local-authentication
2. Setup Face ID / Touch ID
3. Fallback to PIN
4. Secure storage for keys
5. Biometric unlock flow

**Output**: Secure biometric login

---

### Priority 4: Mobile UI (4h)

**Tasks**:

1. Login screen
2. Vault list screen
3. Item list screen
4. Item detail screen
5. Password generator
6. Settings screen
7. Dark theme
8. Animations

**Output**: Complete mobile UI

---

### Priority 5: Sync Integration (2h)

**Tasks**:

1. Integrate `@passkeyper/sync`
2. Mobile sync UI
3. Background sync
4. Offline support
5. Conflict handling

**Output**: Cloud sync working on mobile

---

### Priority 6: Platform-Specific Features (2h)

**Tasks**:

1. Auto-fill credential provider (iOS)
2. Autofill service (Android)
3. Share extension
4. App icons & splash screens
5. Build configurations

**Output**: Native integrations

---

### Priority 7: Testing & Polish (2h)

**Tasks**:

1. E2E tests (Detox)
2. Unit tests
3. Performance optimization
4. Bug fixes
5. Documentation

**Output**: Production-ready apps

---

## 🛠️ TECHNOLOGY STACK

```
Framework:       React Native (latest)
Language:        TypeScript
Navigation:      React Navigation 6
State:           Zustand (same as desktop)
Storage:         @react-native-async-storage/async-storage
Biometric:       expo-local-authentication
Encryption:      @passkeyper/core (reused!)
Sync:            @passkeyper/sync (reused!)
UI:              React Native Paper / Native Base
Testing:         Jest + Detox
Build:           Expo (managed workflow)
```

---

## 📁 PROJECT STRUCTURE

```
apps/mobile/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── VaultsScreen.tsx
│   │   ├── ItemsScreen.tsx
│   │   ├── ItemDetailScreen.tsx
│   │   ├── GeneratorScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── ItemCard.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── BiometricButton.tsx
│   │   └── SyncIndicator.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── store/
│   │   └── app-store.ts (reused from desktop)
│   ├── services/
│   │   ├── biometric.ts
│   │   ├── storage.ts
│   │   └── sync.ts
│   └── utils/
│       └── platform.ts
├── android/
├── ios/
├── app.json
├── package.json
└── tsconfig.json
```

---

## 🎨 MOBILE UI DESIGN

### Screens

1. **Auth Screen**: Biometric + Master Password
2. **Vaults Screen**: List of vaults with icons
3. **Items Screen**: Search + list of items
4. **Item Detail**: View/Edit item, copy fields
5. **Generator**: Password generator with options
6. **Settings**: Auto-lock, biometric, sync settings

### Theme

- Dark theme (consistent with desktop)
- Modern card-based design
- Smooth animations
- Touch-optimized
- Responsive layouts

---

## 🔐 SECURITY FEATURES

```
✅ Biometric authentication (Face ID / Touch ID / Fingerprint)
✅ Master password fallback
✅ Auto-lock after inactivity
✅ Secure storage (iOS Keychain / Android Keystore)
✅ Zero-knowledge encryption (reused from core)
✅ PIN code option
✅ App backgrounding protection
```

---

## 🚀 QUICK START

### Option A: Expo (Recommended for speed)

```bash
cd apps
npx create-expo-app mobile --template expo-template-blank-typescript
cd mobile
npm install

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install expo-local-authentication
npm install @react-native-async-storage/async-storage
npm install zustand

# Link packages
npm install @passkeyper/core@workspace:*
npm install @passkeyper/totp@workspace:*
npm install @passkeyper/sync@workspace:*

# Run
npm run ios
npm run android
```

### Option B: React Native CLI (More control)

```bash
npx react-native init PassKeyPerMobile --template react-native-template-typescript
cd PassKeyPerMobile
# Similar setup as above
```

---

## ✅ SUCCESS CRITERIA

Phase 4 Complete when:

- [ ] Mobile app runs on iOS
- [ ] Mobile app runs on Android
- [ ] Biometric auth works
- [ ] All CRUD operations work
- [ ] TOTP generation works
- [ ] Cloud sync works
- [ ] UI is polished
- [ ] Tests pass

---

## 📈 ESTIMATED PROGRESS

```
Setup:              2h  → 10%
Core Integration:   2h  → 20%
Biometric:          2h  → 30%
UI Screens:         4h  → 60%
Sync:               2h  → 70%
Platform Features:  2h  → 85%
Testing & Polish:   2h  → 100%

Total: ~16 hours to Phase 4: 100%
```

---

## 🎯 LET'S START

**Recommended First Step**: Setup React Native with Expo

**Why Expo**:

- Faster development
- Built-in biometric support
- Easy deployment
- Over-the-air updates
- Good for MVP

**Ready to begin?** 🚀

Choose approach:

1. **Expo (Recommended)** - Faster, easier
2. **RN CLI** - More control, complex
3. **Plan review** - Want to discuss first

---

**Phase 4**: Mobile Apps  
**Target**: 12-16 hours to 100%  
**After**: 50% overall progress!  
**Status**: Ready to start! 🎯
