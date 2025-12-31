---
layout: default
title: PassKeyPer - Modern Zero-Knowledge Password Manager
description: A secure, open-source password manager with TOTP, browser extension, and cloud sync
---

# 🔐 PassKeyPer

**Modern. Secure. Open Source.**

A zero-knowledge password manager with TOTP, browser extension, and cloud sync.

[![GitHub release](https://img.shields.io/github/v/release/donapart/PassKeyPer)](https://github.com/donapart/PassKeyPer/releases)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Build Status](https://img.shields.io/github/actions/workflow/status/donapart/PassKeyPer/ci.yml)](https://github.com/donapart/PassKeyPer/actions)

---

## ✨ Features

### 🔒 Security First
- **Zero-Knowledge Architecture** - Your data is encrypted client-side with AES-256-GCM
- **Master Password Only** - We never see or store your passwords
- **Argon2id Key Derivation** - Industry-leading password hashing

### 🖥️ Cross-Platform
- **Desktop App** - Windows, macOS, Linux (Electron + React)
- **Browser Extension** - Chrome, Firefox, Edge
- **Mobile Apps** - iOS & Android (React Native)

### 🔐 Full Feature Set
- **Password Generator** - Cryptographically secure with strength meter
- **TOTP Authenticator** - RFC 6238 compliant 2FA codes
- **Auto-Fill** - Seamless browser integration
- **Cloud Sync** - Real-time multi-device synchronization
- **Import/Export** - Support for 6+ password manager formats

---

## 🚀 Quick Start

### Download

| Platform | Download |
|----------|----------|
| Windows | [PassKeyPer-Setup-Windows-x64.exe](https://github.com/donapart/PassKeyPer/releases/latest/download/PassKeyPer-Setup-Windows-x64.exe) |
| macOS | [PassKeyPer-macOS-x64.dmg](https://github.com/donapart/PassKeyPer/releases/latest/download/PassKeyPer-macOS-x64.dmg) |
| Linux | [PassKeyPer-Linux-x86_64.AppImage](https://github.com/donapart/PassKeyPer/releases/latest/download/PassKeyPer-Linux-x86_64.AppImage) |
| Android | [PassKeyPer-Android.apk](https://github.com/donapart/PassKeyPer/releases/latest/download/PassKeyPer-Android.apk) |

> 💡 **No releases yet?** Build from source below or wait for the next tagged release.

### Build from Source

```bash
# Clone & install
git clone https://github.com/donapart/PassKeyPer.git
cd PassKeyPer
npm install

# Desktop App
cd apps/desktop && npm run electron:build

# Mobile App (Android)
cd apps/mobile && npx expo run:android
```

### Self-Hosting (Docker)

```bash
git clone https://github.com/donapart/PassKeyPer.git
cd PassKeyPer
docker-compose up -d
```

---

## 📖 Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Specification](SPECIFICATION.md)
- [Browser Extension](NATIVE_MESSAGING.md)
- [Development Roadmap](ROADMAP.md)
- [Comparison with Others](COMPARISON.md)

---

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/donapart/PassKeyPer.git
cd PassKeyPer

# Install dependencies
npm install

# Start desktop app
npm run dev:desktop

# Start API server
npm run dev:api

# Run tests
npm test
```

---

## 📊 Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Core Desktop App |
| Phase 2 | ✅ Complete | TOTP, Import/Export, Browser Extension |
| Phase 3 | ✅ Complete | Cloud Sync Backend |
| Phase 4 | ✅ Complete | Mobile Apps |
| Phase 5 | ✅ Complete | Extension Polish |
| Phase 6 | ✅ Complete | Production Deployment |
| Phase 7 | 🔄 Planned | Team/Family Sharing |
| Phase 8 | 🔄 Planned | Passkey Support |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/donapart/PassKeyPer/blob/main/CONTRIBUTING.md).

---

## 📄 License

PassKeyPer is open-source software licensed under the [AGPL-3.0 License](https://github.com/donapart/PassKeyPer/blob/main/LICENSE).

---

<p align="center">
  Made with ❤️ for a more secure internet
</p>
