# Password Manager Comparison Matrix

Evaluation of popular password managers against PassKeyPer specifications.

## Legend

- ✅ Fully supported
- ⚠️ Partially supported / Limited
- ❌ Not supported
- 🔒 Premium feature
- 🏢 Enterprise only

---

## 1. Security & Encryption

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Zero-knowledge architecture** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AES-256 encryption** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Argon2id KDF** | ✅ | 🔒 PBKDF2 | ✅ | ❌ PBKDF2 | ✅ | ⚠️ Optional |
| **Client-side encryption** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **E2E encryption for sharing** | ✅ | ✅ | 🔒 | ⚠️ | ✅ | ❌ |
| **Hardware security key (FIDO2)** | ✅ | 🔒 | 🔒 | 🔒 | 🔒 | ❌ |
| **Biometric unlock** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Auto-lock on inactivity** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Memory protection** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |

**Winner**: PassKeyPer, 1Password, KeePass (tie for security-focused features)

---

## 2. Password Management

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Password generator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Passphrase generator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Entropy display** | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| **Password history per item** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Password strength meter** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Weak password detection** | ✅ | ✅ Watchtower | ✅ | ✅ | ✅ | ⚠️ Plugins |
| **Reused password detection** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Password age tracking** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| **HIBP breach monitoring** | ✅ | ✅ | 🔒 | ✅ | ✅ | ⚠️ Plugins |
| **Auto-password change** | ⚠️ Future | ⚠️ Limited | ❌ | ⚠️ Limited | ✅ | ❌ |

**Winner**: 1Password, Dashlane (most mature password health features)

---

## 3. Browser & Autofill

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Chrome extension** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Firefox extension** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Safari extension** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Edge extension** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manifest V3 support** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| **Native messaging** | ✅ | ✅ | ✅ | ❌ Cloud | ✅ | ✅ |
| **Domain matching** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Phishing protection** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| **Multi-page form support** | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **Inline autofill suggestions** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Winner**: 1Password, Dashlane (most polished autofill experience)

---

## 4. Platform Support

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Windows** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Linux** | ✅ | 🔒 | ✅ | ⚠️ | ❌ | ✅ |
| **iOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Android** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Web app** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **CLI tool** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| **Universal binary (M1 Mac)** | ✅ | ✅ | ✅ | ⚠️ | ✅ | N/A |

**Winner**: Bitwarden (best cross-platform support including Linux)

---

## 5. Mobile Features

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **iOS AutoFill Provider** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Android Autofill Service** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Face ID / Touch ID** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Fingerprint / Face unlock** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **System keychain integration** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| **App-specific passwords** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **QR code scanner (TOTP)** | ✅ | ✅ | 🔒 | ⚠️ | ✅ | ❌ |

**Winner**: 1Password, Dashlane (best mobile UX)

---

## 6. Data Types & Organization

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Logins** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Credit cards** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Secure notes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Identities** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **API keys** | ✅ | ✅ | ✅ | ⚠️ Notes | ⚠️ Notes | ✅ |
| **SSH keys** | ✅ | ✅ | ⚠️ Notes | ❌ | ❌ | ✅ |
| **TOTP secrets** | ✅ | ✅ | 🔒 | ⚠️ | ✅ | ✅ Plugins |
| **File attachments** | ✅ | ✅ | 🔒 1GB | 🔒 | ✅ | ✅ |
| **Custom fields** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Custom templates** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| **Folders** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tags** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| **Multiple vaults** | ✅ | ✅ | ⚠️ Org only | ✅ | ❌ | ✅ |
| **Smart collections** | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |

**Winner**: 1Password, PassKeyPer (most comprehensive data type support)

---

## 7. Sync & Multi-Device

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Real-time sync** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ Manual |
| **Offline access** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Conflict resolution** | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ Manual |
| **Delta sync** | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| **Device limit (free tier)** | 2 | ❌ No free | ♾️ | 1 | 1 | ♾️ |
| **Device management UI** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Remote logout** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Winner**: 1Password, Dashlane (best sync experience)

---

## 8. Sharing & Collaboration

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Item-level sharing** | ✅ | ✅ | ✅ | 🔒 | ✅ | ❌ |
| **Permission levels** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **Share links** | ✅ | ⚠️ Psst | ⚠️ Send | ⚠️ | ⚠️ | ❌ |
| **Time-limited links** | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| **Shared vaults** | ✅ | ✅ | 🏢 | 🔒 | 🔒 | ⚠️ Sync |
| **Team/Organization** | ✅ | 🏢 | 🏢 | 🏢 | 🏢 | ❌ |
| **Role-based access** | ✅ | 🏢 | 🏢 | 🏢 | 🏢 | ❌ |
| **Emergency access** | ✅ | 🔒 | 🔒 | 🔒 | ⚠️ | ❌ |
| **SSO integration** | 🏢 Future | 🏢 | 🏢 | 🏢 | 🏢 | ❌ |

**Winner**: 1Password (most mature enterprise sharing features)

---

## 9. Import/Export

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Import from CSV** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Import from 1Password** | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| **Import from Bitwarden** | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| **Import from LastPass** | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| **Import from Dashlane** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| **Import from KeePass** | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| **Import from browsers** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Duplicate detection** | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| **Export encrypted** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Export unencrypted** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Automatic backups** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ Manual |

**Winner**: 1Password, PassKeyPer (best migration support)

---

## 10. Developer Features

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **CLI tool** | ✅ | ✅ | ✅ | ⚠️ Limited | ❌ | ⚠️ KeePassXC |
| **REST API** | ✅ | ✅ Connect | ✅ | ⚠️ | ❌ | ❌ |
| **SDK libraries** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ Community |
| **Webhook support** | ✅ | 🏢 | ⚠️ | ❌ | ❌ | ❌ |
| **JSON output (CLI)** | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| **CI/CD integration** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| **Git credential helper** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ⚠️ |
| **SSH agent integration** | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| **Environment file export** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ⚠️ |

**Winner**: 1Password (best developer experience with Secrets Automation)

---

## 11. Passkeys & WebAuthn

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Store passkeys** | ✅ | ✅ | ✅ Beta | ⚠️ | ✅ | ❌ |
| **Sync passkeys** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| **Autofill passkeys** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| **Hardware key (FIDO2) for account** | ✅ | 🔒 | 🔒 | 🔒 | 🔒 | ❌ |
| **Platform authenticator** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |

**Winner**: 1Password, Dashlane (early passkey adopters)

---

## 12. Self-Hosting & Open Source

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **Open source** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Self-hosting option** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Docker containers** | ✅ | ❌ | ✅ | ❌ | ❌ | ⚠️ Community |
| **Kubernetes support** | ✅ | ❌ | ⚠️ Community | ❌ | ❌ | ⚠️ |
| **Source code audit** | ✅ | ⚠️ Whitepapers | ✅ | ❌ | ❌ | ✅ |
| **Community plugins** | ✅ Future | ❌ | ⚠️ | ❌ | ❌ | ✅ Extensive |

**Winner**: Bitwarden, KeePass (open source champions)

---

## 13. Pricing (as of 2024)

| Tier | PassKeyPer | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|------|------------|-----------|-----------|----------|----------|---------|
| **Free** | ✅ Limited | ❌ | ✅ Full | ✅ Limited | ✅ Limited | ✅ Full |
| **Personal** | €3/mo | $2.99/mo | $10/year | $3/mo | $4.99/mo | Free |
| **Family** | €5/mo | $4.99/mo (5) | $40/year (6) | $4/mo (6) | $7.49/mo (10) | Free |
| **Teams** | €5/user | $7.99/user | $40/user/yr | $7/user | $8/user | Free |
| **Enterprise** | Custom | Custom | Custom | Custom | Custom | Free |

**Winner**: KeePass (free), Bitwarden (best value for premium)

---

## 14. Compliance & Trust

| Feature | PassKeyPer (Target) | 1Password | Bitwarden | LastPass | Dashlane | KeePass |
|---------|---------------------|-----------|-----------|----------|----------|---------|
| **SOC 2 Type II** | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| **ISO 27001** | ✅ | ✅ | ✅ | ⚠️ | ✅ | N/A |
| **GDPR compliance** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| **Bug bounty program** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| **Third-party audits** | ✅ | ✅ | ✅ | ⚠️ | ✅ | Community |
| **Transparency reports** | ✅ | ✅ | ✅ | ❌ | ⚠️ | N/A |
| **Data residency (EU)** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ Self-host |

**Winner**: 1Password, Bitwarden (strong security track record)

---

## Overall Scoring

### Feature Completeness (out of 100)

1. **1Password**: 92/100 - Most polished, enterprise-ready
2. **PassKeyPer (Target)**: 90/100 - Comprehensive spec, needs development
3. **Bitwarden**: 85/100 - Great open-source option, rapidly improving
4. **Dashlane**: 78/100 - User-friendly, lacking developer features
5. **LastPass**: 65/100 - Declining, security concerns
6. **KeePass**: 60/100 - Powerful but dated UX, plugins required

### Best For

| Use Case | Recommendation |
|----------|----------------|
| **General users** | 1Password, Dashlane |
| **Developers** | **PassKeyPer**, 1Password, Bitwarden |
| **Privacy enthusiasts** | **PassKeyPer**, Bitwarden, KeePass |
| **Teams/Enterprise** | 1Password, Bitwarden |
| **Self-hosting** | **PassKeyPer**, Bitwarden, KeePass |
| **Budget-conscious** | Bitwarden, KeePass |
| **Open source preference** | **PassKeyPer**, Bitwarden, KeePass |
| **Family** | 1Password, Bitwarden |

### PassKeyPer Unique Advantages

✅ **Developer-first features** (CLI, API, SSH keys, env export)
✅ **Modern crypto** (Argon2id standard, not premium)
✅ **Open source + commercial** (best of both worlds)
✅ **Self-hosting ready** (Docker, Kubernetes from day 1)
✅ **Passkey-native** (not bolted on)
✅ **Privacy-focused** (EU-first, no telemetry)

### Gaps to Fill (vs. 1Password)

⚠️ **Mature ecosystem** (1Password has 15+ years)
⚠️ **Travel mode**
⚠️ **Psst (secure sharing links)**
⚠️ **Watchtower intelligence** (auto password change)
⚠️ **Enterprise SSO/SCIM** (planned for later)

---

## Recommendation for PassKeyPer Development

### Priority 1: Match (MVP)

- Core security (zero-knowledge, AES-256, Argon2id)
- Cross-platform desktop & mobile apps
- Browser extensions
- Password generator + health score
- HIBP breach monitoring
- Basic sharing

### Priority 2: Differentiate

- **Superior CLI/API** (beat 1Password)
- **SSH key management** (better than 1Password's SSH agent)
- **Self-hosting** (beat Bitwarden's UX)
- **Passkey-first UI** (not an afterthought)
- **Developer workflows** (Git, CI/CD, `.env` export)

### Priority 3: Enterprise

- SSO/SCIM
- Advanced audit logs
- Policy enforcement
- MSP/White-label

This strategy positions PassKeyPer as the **developer's choice** while being accessible to general users.
