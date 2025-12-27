# PassKeyPer Desktop App

Electron-based desktop application for PassKeyPer password manager.

## Features

- 🔐 **Zero-Knowledge Encryption** - Master password never leaves your device
- 💾 **Local-First** - All data stored locally in encrypted SQLite database
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS
- ⚡ **Fast** - Instant search and filtering
- 🔒 **Secure** - Auto-lock, encrypted storage, secure IPC

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **better-sqlite3** - Local database
- **@passkeyper/core** - Cryptography
- **@passkeyper/storage** - Vault storage

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run electron:dev

# Build for production
npm run electron:build
```

## Project Structure

```
apps/desktop/
├── electron/
│   ├── main.ts              # Electron main process
│   └── preload.ts           # Preload script (IPC bridge)
├── src/
│   ├── components/
│   │   ├── LoginScreen.tsx  # Authentication UI
│   │   ├── TitleBar.tsx     # Custom window controls
│   │   └── VaultView.tsx    # Main vault interface
│   ├── store/
│   │   └── app-store.ts     # Zustand state management
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## Security

### Encryption Flow

1. **Master Password** → Argon2id (3 iterations, 64MB RAM)
2. **Master Key** → HKDF → Encryption Key + Auth Key
3. **Vault Items** → AES-256-GCM with Encryption Key
4. **Server Hash** → Argon2id(Master Key, 1 iteration) for auth

### Local Storage

- Database: `%APPDATA%/PassKeyPer/vault.db` (Windows)
- All data encrypted before storage
- Only encrypted blobs stored in database
- Encryption key stored in memory only (never persisted)

### IPC Security

- Context isolation enabled
- No `nodeIntegration`
- Preload script with whitelist
- All IPC calls type-safe

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run electron:dev` - Start Electron in dev mode
- `npm run build` - Build for production
- `npm run electron:build` - Build and package Electron app
- `npm run preview` - Preview production build

## Build Output

Built apps will be in `release/` directory:

- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg`  installer
- **Linux**: `.AppImage`, `.deb`

## Keyboard Shortcuts

- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + N` - New item
- `Ctrl/Cmd + L` - Lock vault
- `Ctrl/Cmd + Q` - Quit app
- `Ctrl/Cmd + ,` - Settings

## Auto-Lock

Vault automatically locks:

- After 15 minutes of inactivity (configurable)
- When system goes to sleep
- When app is minimized (optional)

## Roadmap

- [x] Basic authentication
- [x] Local vault storage
- [x] Item listing
- [ ] Item create/edit modal
- [ ] Password generator integration
- [ ] TOTP support
- [ ] Favorites & folders
- [ ] Import/Export
- [ ] Settings panel
- [ ] Auto-lock configuration
- [ ] Browser extension integration

## License

AGPL-3.0 - see LICENSE file
