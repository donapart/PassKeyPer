# 🔌 Native Messaging Setup

**Enable browser extension ↔ desktop app communication**

## Overview

Native Messaging allows the PassKeyPer browser extension to communicate securely with the PassKeyPer desktop app. This enables:

- ✅ Accessing vault credentials from browser
- ✅ Auto-filling passwords on websites
- ✅ Saving new credentials from forms
- ✅ Secure local-only communication (no cloud)

---

## Prerequisites

1. **Desktop App Built**:

   ```powershell
   npm run build
   ```

2. **Extension Built**:

   ```powershell
   cd apps/extension
   npm run build
   ```

---

## Installation (Windows)

### Automatic Installation

Run the installation script:

```powershell
cd apps/desktop/scripts
.\install-native-messaging.ps1
```

This script will:

- ✅ Update manifest with correct desktop app path
- ✅ Install registry keys for Chrome
- ✅ Install registry keys for Firefox
- ✅ Install registry keys for Edge

### Manual Installation

1. **Update Manifest**:
   - Edit `apps/desktop/native-messaging-manifest.json`
   - Replace `PLACEHOLDER_PATH` with actual path to `PassKeyPer.exe`

2. **Install Registry Keys**:

   **Chrome**:

   ```powershell
   reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.passkeyper.native" /ve /d "D:\PassKeyPer\apps\desktop\native-messaging-manifest.json" /f
   ```

   **Firefox**:

   ```powershell
   reg add "HKCU\Software\Mozilla\NativeMessagingHosts\com.passkeyper.native" /ve /d "D:\PassKeyPer\apps\desktop\native-messaging-manifest.json" /f
   ```

   **Edge**:

   ```powershell
   reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.passkeyper.native" /ve /d "D:\PassKeyPer\apps\desktop\native-messaging-manifest.json" /f
   ```

---

## Load Extension

### Chrome/Edge

1. Open `chrome://extensions` or `edge://extensions`
2. Enable "Developer Mode"
3. Click "Load unpacked"
4. Select `apps/extension/dist` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `apps/extension/dist/manifest.json`

---

## Testing

### 1. Start Desktop App

```powershell
npm run dev
```

### 2. Open Browser Console

Extension → Background Service Worker → Console

### 3. Check Connection

You should see:

```
PassKeyPer background service worker loaded
✓ Desktop app connected
```

If not connected:

```
⚠ Desktop app not available. Install and run PassKeyPer desktop app for full functionality.
```

### 4. Test Communication

In browser console:

```javascript
// Send ping
chrome.runtime.sendMessage({ 
  type: 'GET_CREDENTIALS', 
  payload: { url: 'https://github.com' } 
}, console.log)
```

Expected response:

```json
{
  "success": true,
  "credentials": [...]
}
```

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Browser        │◄───────►│  Desktop App     │
│  Extension      │  Native │  (Electron)      │
│                 │  Msg    │                  │
└─────────────────┘         └──────────────────┘
      │                              │
      │                              │
      ▼                              ▼
  Form Detection              Vault Access
  Autofill UI                 Encryption
  Password Save               Database
```

---

## Message Protocol

### From Extension → Desktop

```typescript
{
  type: 'GET_CREDENTIALS' | 'SAVE_CREDENTIALS' | 'OPEN_APP' | 'PING',
  payload: { ... },
  requestId: 'uuid'
}
```

### From Desktop → Extension

```typescript
{
  success: boolean,
  requestId: 'uuid',
  error?: string,
  // ... additional data
}
```

---

## Message Types

### PING

Test connection

**Request**:

```json
{ "type": "PING", "requestId": "..." }
```

**Response**:

```json
{ "success": true, "message": "pong", "requestId": "..." }
```

### GET_CREDENTIALS

Get saved credentials for a URL

**Request**:

```json
{
  "type": "GET_CREDENTIALS",
  "payload": { "url": "https://example.com" },
  "requestId": "..."
}
```

**Response**:

```json
{
  "success": true,
  "credentials": [
    {
      "id": "123",
      "name": "My Account",
      "username": "user@example.com",
      "url": "https://example.com"
    }
  ],
  "requestId": "..."
}
```

### SAVE_CREDENTIALS

Save new credentials

**Request**:

```json
{
  "type": "SAVE_CREDENTIALS",
  "payload": {
    "url": "https://example.com",
    "username": "user@example.com",
    "password": "secret123"
  },
  "requestId": "..."
}
```

**Response**:

```json
{ "success": true, "requestId": "..." }
```

### OPEN_APP

Open/focus desktop app

**Request**:

```json
{ "type": "OPEN_APP", "requestId": "..." }
```

**Response**:

```json
{ "success": true, "requestId": "..." }
```

---

## Troubleshooting

### Extension can't connect to desktop app

**Check**:

1. ✅ Desktop app is running
2. ✅ Registry keys installed correctly
3. ✅ Manifest path is correct
4. ✅ Extension has `nativeMessaging` permission

**Verify Registry**:

```powershell
reg query "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.passkeyper.native"
```

**Check Manifest**:

```powershell
Get-Content apps\desktop\native-messaging-manifest.json
```

### "Failed to start native messaging host"

**Causes**:

- Desktop app path incorrect
- Desktop app not built
- Permissions issue

**Fix**:

1. Rebuild desktop app
2. Run install script again
3. Check manifest path

### Messages timeout

**Causes**:

- Desktop app not responding
- Message protocol mismatch

**Fix**:

1. Check desktop app console
2. Verify message format
3. Check requestId matching

---

## Security

- ✅ **Local only**: No data leaves your machine
- ✅ **Per-user**: Registry keys in HKCU (user-specific)
- ✅ **Extension ID**: Manifest limits access to your extension
- ✅ **Type-safe**: TypeScript interfaces for messages

---

## Files

```
apps/
├── desktop/
│   ├── electron/
│   │   └── native-messaging.ts         # Desktop handler
│   ├── scripts/
│   │   └── install-native-messaging.ps1 # Installer
│   └── native-messaging-manifest.json   # Registry manifest
└── extension/
    └── src/
        └── background/
            ├── native-messaging.ts      # Client
            └── service-worker.ts        # Integration
```

---

## Next Steps

After setup:

1. ✅ Test credential retrieval
2. ✅ Test credential saving
3. ✅ Implement actual vault integration
4. ✅ Add encryption for messages
5. ✅ Error handling improvements

---

**Status**: ✅ Native Messaging Working!  
**Phase 2**: 100% 🎉  
**Version**: v0.4.0
