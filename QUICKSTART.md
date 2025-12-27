# 🚀 Quick Start Guide - PassKeyPer

Welcome to PassKeyPer! This guide will help you get the desktop app running on your machine.

## Prerequisites

- **Node.js** 18+ (includes npm)
- **Git** (for cloning)
- Windows 10/11, macOS, or Linux

## Installation

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd d:/PassKeyPer

# Install all dependencies (monorepo)
npm install
```

This will install dependencies for:

- Root workspace
- `packages/core` - Cryptography
- `packages/storage` - Local vault
- `apps/desktop` - Electron app

### 2. Build Core Packages

Before running the desktop app, build the shared packages:

```bash
# Build all packages
npm run build

# Or build specific packages
cd packages/core
npm run build

cd ../storage
npm run build
```

### 3. Run Desktop App

```bash
cd apps/desktop
npm run electron:dev
```

This will:

1. Start Vite dev server (React)
2. Launch Electron window
3. Hot-reload on file changes

## First Use

### Create Your Account

1. **Enter your email** (used for key derivation)
2. **Create master password** (strong, memorable, NEVER forget!)
3. Click **"Create Account"**

⚠️ **IMPORTANT**: Your master password cannot be recovered! Write it down somewhere safe.

### How It Works

```
Your Master Password
        ↓
    Argon2id (3 iterations, 64MB RAM)
        ↓
    Master Key (32 bytes)
        ↓
    HKDF → Encryption Key + Auth Key
        ↓
    AES-256-GCM encrypts all vault items
```

- **Zero-knowledge**: Your password NEVER leaves your device
- **Local-first**: All data stored in SQLite on your computer
- **Encrypted**: Even if someone steals your laptop, data is useless without masterpassword

### Create Your First Password

1. Click **"New Item"** button
2. Choose item type (Login, Note, Card, etc.)
3. Fill in details
4. Click **"Save"**

Everything is encrypted automatically before storage!

## Development

### Project Structure

```
PassKeyPer/
├── packages/
│   ├── core/          # Cryptography (Argon2id, AES-256-GCM)
│   └── storage/       # SQLite vault storage
│
├── apps/
│   └── desktop/       # Electron + React app
│
└── docs/              # Specifications & guides
```

### Available Commands

#### Root Commands (from `d:/PassKeyPer`)

```bash
npm run build          # Build all packages
npm run test           # Run all tests
npm run dev            # Start all dev servers
npm run lint           # Lint all code
```

#### Desktop App Commands (from `apps/desktop`)

```bash
npm run electron:dev   # Development mode
npm run electron:build # Build production app
npm run type-check     # TypeScript check
```

#### Core Package Commands (from `packages/core`)

```bash
npm run build          # Build package
npm run test           # Run unit tests
npm run test:watch     # Watch mode
npm run dev            # Build in watch mode
```

## Data Storage

### Where is my data?

Your encrypted vault is stored at:

- **Windows**: `%APPDATA%/PassKeyPer/vault.db`
- **macOS**: `~/Library/Application Support/PassKeyPer/vault.db`
- **Linux**: `~/.config/PassKeyPer/vault.db`

### Is it safe?

✅ **YES!** Here's why:

1. **Zero-Knowledge Encryption**
   - Master password → Argon2id (memory-hard)
   - 64MB RAM requirement (GPU-attack resistant)
   - 256-bit AES-GCM (authenticated encryption)

2. **Local-First**
   - No cloud involved (yet)
   - Your device, your keys
   - No telemetry, no tracking

3. **Open Source**
   - Full transparency
   - Community auditable
   - AGPL-3.0 license

### Can I export my data?

Yes! (Coming soon in Phase 2)

- Export to encrypted JSON
- Export to CSV (with warning)
- Compatible with other password managers

## Troubleshooting

### SQLite errors

If you see database errors:

```bash
# Delete the database and start fresh
# Windows
del %APPDATA%\PassKeyPer\vault.db

# macOS/Linux
rm ~/Library/Application\ Support/PassKeyPer/vault.db
```

### Build errors

```bash
# Clean install
rm -rf node_modules
npm install

# Rebuild native modules
cd apps/desktop
npm rebuild
```

### Electron won't start

```bash
# Check Electron installation
cd apps/desktop
npm ls electron

# Reinstall if needed
npm install electron@latest
```

## Next Steps

### Learn More

- [📋 Full Specification](../docs/SPECIFICATION.md) - Complete feature list
- [🏗️ Architecture](../docs/ARCHITECTURE.md) - Technical design
- [🗺️ Roadmap](../docs/ROADMAP.md) - Development timeline
- [📊 Comparison](../docs/COMPARISON.md) - vs other password managers

### Contribute

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Pick an issue from GitHub
3. Submit a PR

### Stay Updated

- ⭐ Star the repo
- 👀 Watch for releases
- 🐛 Report bugs via Issues

## Security Notice

🔒 **Never share your master password with anyone!**

- PassKeyPer developers will NEVER ask for it
- It cannot be recovered if forgotten
- Write it down and store it safely

If you forget your master password, your vault is permanently locked. This is by design (zero-knowledge architecture).

## Support

- 📖 [Documentation](../docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/passkeyper/issues)
- 💬 [Discussions](https://github.com/yourusername/passkeyper/discussions)

---

**Happy password managing! 🔐**
