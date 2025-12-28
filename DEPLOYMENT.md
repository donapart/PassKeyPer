# 🚀 Deployment Guide - PassKeyPer

This guide covers deploying PassKeyPer for development, testing, and production use.

## 📋 Table of Contents

- [Local Development](#local-development)
- [Building for Production](#building-for-production)
- [Platform-Specific Builds](#platform-specific-builds)
- [Code Signing](#code-signing)
- [Distribution](#distribution)
- [Auto-Updates](#auto-updates)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm 9+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/passkeyper.git
cd passkeyper

# Install dependencies
npm install

# Build packages
npm run build

# Start desktop app in dev mode
cd apps/desktop
npm run electron:dev
```

### Development Workflow

```bash
# Watch mode for packages
cd packages/core
npm run dev  # Watches and rebuilds on changes

# In another terminal
cd apps/desktop
npm run electron:dev  # Hot reload enabled
```

---

## 📦 Building for Production

### Build All Packages

```bash
# From project root
npm run build

# This will:
# 1. Build @passkeyper/core
# 2. Build @passkeyper/storage
# 3. Build desktop app assets
```

### Build Desktop App

```bash
cd apps/desktop

# Development build
npm run build

# Production build with installer
npm run electron:build
```

Output locations:

- **Windows**: `apps/desktop/release/PassKeyPer Setup X.X.X.exe`
- **macOS**: `apps/desktop/release/PassKeyPer-X.X.X.dmg`
- **Linux**: `apps/desktop/release/PassKeyPer-X.X.X.AppImage`

---

## 💻 Platform-Specific Builds

### Windows

```bash
# Install dependencies
npm ci

# Build
cd apps/desktop
npm run electron:build -- --win

# Output: PassKeyPer-Setup-X.X.X.exe
```

**Requirements:**

- Windows 10+ (for building)
- NSIS (installed automatically)

**Code Signing** (optional):

```bash
# Set environment variables
$env:WIN_CSC_LINK = "path/to/certificate.pfx"
$env:WIN_CSC_KEY_PASSWORD = "certificate-password"

# Build with signing
npm run electron:build -- --win
```

### macOS

```bash
# Install dependencies
npm ci

# Build
cd apps/desktop
npm run electron:build -- --mac

# Output: PassKeyPer-X.X.X.dmg
```

**Requirements:**

- macOS 10.13+ (for building)
- Xcode Command Line Tools

**Code Signing** (required for distribution):

```bash
# Set environment variables
export APPLEID="your@apple.id"
export APPLEIDPASS="app-specific-password"
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"

# Build with signing & notarization
npm run electron:build -- --mac
```

**Notarization:**

- Required for macOS 10.15+
- Automatically handled by electron-builder
- Requires Apple Developer account

### Linux

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y rpm

# Build
cd apps/desktop
npm run electron:build -- --linux

# Output: 
# - PassKeyPer-X.X.X.AppImage
# - PassKeyPer-X.X.X.deb (optional)
# - PassKeyPer-X.X.X.rpm (optional)
```

**Build specific formats:**

```bash
# AppImage only
npm run electron:build -- --linux AppImage

# Deb package
npm run electron:build -- --linux deb

# RPM package  
npm run electron:build -- --linux rpm
```

---

## 🔐 Code Signing

### Why Code Sign?

- **Windows**: Prevents "Unknown Publisher" warnings
- **macOS**: Required for distribution, prevents Gatekeeper blocks
- **Linux**: Optional but recommended

### Windows Certificate

1. Purchase code signing certificate (DigiCert, SSL.com, etc.)
2. Export as `.pfx` file
3. Set environment variables:

```powershell
$env:WIN_CSC_LINK = "C:\path\to\cert.pfx"
$env:WIN_CSC_KEY_PASSWORD = "your-password"
```

### macOS Certificate

1. Enroll in Apple Developer Program ($99/year)
2. Create "Developer ID Application" certificate
3. Export as `.p12` file
4. Set environment variables:

```bash
export CSC_LINK="/path/to/cert.p12"
export CSC_KEY_PASSWORD="your-password"
export APPLEID="your@apple.id"
export APPLEIDPASS="app-specific-password"
```

### Generate App-Specific Password (macOS)

1. Go to <https://appleid.apple.com>
2. Sign in
3. Generate app-specific password
4. Save securely

---

## 📤 Distribution

### Direct Downloads

Host installer files on:

- GitHub Releases (recommended)
- Website downloads page
- CDN (CloudFlare, AWS S3)

### Package Managers

#### Windows (Chocolatey)

```bash
# Create chocolatey package
choco pack

# Publish
choco push PassKeyPer.X.X.X.nupkg
```

#### macOS (Homebrew)

```ruby
# Create formula
cask "passkeyper" do
  version "X.X.X"
  sha256 "hash"
  
  url "https://github.com/.../PassKeyPer-#{version}.dmg"
  name "PassKeyPer"
  desc "Zero-knowledge password manager"
  homepage "https://passkeyper.com"
  
  app "PassKeyPer.app"
end
```

#### Linux (Snap Store)

```bash
# Create snapcraft.yaml
# Publish to Snap Store
snapcraft login
snapcraft upload passkeyper_X.X.X_amd64.snap
```

---

## 🔄 Auto-Updates

PassKeyPer uses electron-updater for auto-updates.

### Setup Auto-Updates

1. **GitHub Releases** (recommended):
   - Tag releases as `vX.X.X`
   - Upload installers to release
   - electron-updater checks GitHub

2. **Custom Server**:

   ```typescript
   // In electron/main.ts
   autoUpdater.setFeedURL({
     provider: 'generic',
     url: 'https://updates.passkeyper.com'
   })
   ```

### Update Flow

1. App checks for updates on startup
2. Download in background
3. Notify user when ready
4. Install on app restart

### Configuration

```json
// package.json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "yourusername",
      "repo": "passkeyper"
    }
  }
}
```

---

## 🧪 Testing Builds

### Pre-Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] Type check clean (`npm run type-check`)
- [ ] Lint clean (`npm run lint`)
- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated
- [ ] Git tag created
- [ ] Code signed (Windows/macOS)
- [ ] Tested on target platform

### Manual Testing

1. Install built package
2. Create account
3. Create vault
4. Create items
5. Test all features
6. Test auto-lock
7. Test keyboard shortcuts
8. Test search
9. Restart app (persistence test)
10. Uninstall cleanly

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: `npm run build` fails

**Solutions**:

```bash
# Clear cache
npm run clean
rm -rf node_modules
npm install

# Rebuild native modules
cd apps/desktop
npm rebuild

# Check Node version
node --version  # Should be 18+
```

### Windows Signing Fails

**Problem**: Certificate errors

**Solutions**:

- Verify `.pfx` file exists
- Check password is correct
- Ensure certificate not expired
- Install certificate to Windows cert store

### macOS Notarization Fails

**Problem**: "Could not notarize"

**Solutions**:

- Verify Apple ID credentials
- Check app-specific password
- Ensure Developer ID certificate valid
- Check Apple server status
- Wait 5-10 minutes and retry

### Linux AppImage Not Running

**Problem**: Permission denied

**Solutions**:

```bash
# Make executable
chmod +x PassKeyPer-X.X.X.AppImage

# Run
./PassKeyPer-X.X.X.AppImage

# Install FUSE if needed
sudo apt-get install fuse
```

---

## 📋 Release Checklist

### Pre-Release

- [ ] Update version in all `package.json` files
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Test on all target platforms
- [ ] Update documentation if needed
- [ ] Create git tag: `git tag v0.1.0`

### Build

- [ ] Build Windows installer (signed)
- [ ] Build macOS DMG (signed & notarized)
- [ ] Build Linux AppImage
- [ ] Build Linux Deb/RPM (optional)

### Publish

- [ ] Create GitHub release
- [ ] Upload all installers
- [ ] Update checksums (SHA256)
- [ ] Publish release notes
- [ ] Update website downloads
- [ ] Announce on social media
- [ ] Update package managers

### Post-Release

- [ ] Monitor for issues
- [ ] Respond to bug reports
- [ ] Plan next version
- [ ] Update roadmap

---

## 🔗 Useful Links

- [electron-builder docs](https://www.electron.build/)
- [Code signing guide](https://www.electron.build/code-signing)
- [Auto-updates guide](https://www.electron.build/auto-update)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## 📞 Support

- **Issues**: <https://github.com/yourusername/passkeyper/issues>
- **Discussions**: <https://github.com/yourusername/passkeyper/discussions>
- **Email**: <support@passkeyper.com>

---

**Last Updated**: 2025-12-27  
**Version**: 1.0
