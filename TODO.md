# 📋 PassKeyPer - TODO & Roadmap

**Last Updated**: 2025-12-27 23:55  
**Current Version**: 0.3.0  
**Overall Progress**: 20.9% (1.67/8 phases)

---

## 🔥 IMMEDIATE PRIORITIES (Next Session)

### Phase 2 Completion (47.5% remaining)

**1. Browser Extension Integration** (2-3 hours)

- [ ] Complete native messaging setup
  - [ ] Registry installation scripts (Windows)
  - [ ] Manifest installation (macOS/Linux)
  - [ ] Test desktop ↔ browser connection
- [ ] Desktop IPC integration
  - [ ] Handle extension messages in main process
  - [ ] Vault data access from extension
  - [ ] Real credential loading
- [ ] Form auto-save
  - [ ] Detect form submission
  - [ ] Prompt user to save
  - [ ] Update existing credentials
- [ ] Testing
  - [ ] Test on real websites (GitHub, Gmail, etc.)
  - [ ] Cross-browser testing (Firefox)
  - [ ] Multi-account scenarios

**2. TOTP Desktop Integration** (1 hour)

- [ ] Add TOTP field to ItemModal
- [ ] Display TOTP in ItemDetailModal
- [ ] QR code scanner (jsQR library)
- [ ] Import TOTP from URI
- [ ] Export TOTP codes

**3. Import/Export UI** (1 hour)

- [ ] Add menu items to sidebar
- [ ] Create ImportModal component
- [ ] Create ExportModal component
- [ ] File picker integration
- [ ] Progress indicator
- [ ] Success/error handling

---

## 🎯 SHORT-TERM (Weeks 10-12)

### Phase 3: Cloud Sync Completion (70% remaining)

**Week 10: Complete API** (4-6 hours)

- [ ] Item CRUD routes
  - [ ] GET /api/items/:id
  - [ ] PUT /api/items/:id
  - [ ] DELETE /api/items/:id
  - [ ] POST /api/items/:id/versions
- [ ] Sharing routes
  - [ ] POST /api/vaults/:id/share
  - [ ] GET /api/shares
  - [ ] PUT /api/shares/:id
  - [ ] DELETE /api/shares/:id
- [ ] Device management
  - [ ] POST /api/devices
  - [ ] GET /api/devices
  - [ ] DELETE /api/devices/:id
- [ ] Testing
  - [ ] Unit tests for all routes
  - [ ] Integration tests
  - [ ] Load testing

**Week 11: Desktop Sync Client** (6-8 hours)

- [ ] Create @passkeyper/sync package
  - [ ] Sync service class
  - [ ] WebSocket client
  - [ ] Offline queue
  - [ ] Conflict detector
- [ ] Desktop integration
  - [ ] Background sync worker
  - [ ] Sync on startup
  - [ ] Sync on change
  - [ ] Network status detection
- [ ] UI components
  - [ ] Sync status indicator
  - [ ] Sync progress
  - [ ] Last sync timestamp
  - [ ] Manual sync button

**Week 12: Conflict Resolution & Polish** (4-6 hours)

- [ ] Conflict resolution UI
  - [ ] Show conflicting versions
  - [ ] Manual resolution options
  - [ ] Auto-merge strategies
- [ ] Error handling
  - [ ] Network errors
  - [ ] Auth errors
  - [ ] Sync errors
- [ ] Testing
  - [ ] E2E sync tests
  - [ ] Multi-device scenarios
  - [ ] Offline mode tests
- [ ] Performance
  - [ ] Optimize sync algorithm
  - [ ] Batch operations
  - [ ] Compression

---

## 🚀 MEDIUM-TERM (Weeks 13-24)

### Phase 4: Mobile Apps (Weeks 13-16)

**Setup** (Week 13)

- [ ] Initialize React Native project
- [ ] Setup build pipeline (iOS + Android)
- [ ] Configure TypeScript
- [ ] Setup navigation (React Navigation)

**Core Features** (Week 14)

- [ ] Login/Signup screens
- [ ] Vault list
- [ ] Item list
- [ ] Item detail
- [ ] Password generator

**Platform Integration** (Week 15)

- [ ] Biometric authentication (Face ID, Touch ID, Fingerprint)
- [ ] AutoFill integration (iOS + Android)
- [ ] Secure storage (Keychain, KeyStore)
- [ ] Camera (QR scanner)

**Sync & Polish** (Week 16)

- [ ] Cloud sync integration
- [ ] Offline mode
- [ ] Testing
- [ ] App store submission

---

### Phase 5: Team Features (Weeks 17-20)

**Secure Sharing** (Week 17)

- [ ] Public key infrastructure
- [ ] Vault sharing with encryption
- [ ] Permission management
- [ ] Share invitations

**Team Management** (Week 18)

- [ ] Organization creation
- [ ] Team vaults
- [ ] User roles (admin, member, viewer)
- [ ] Audit logs

**SSO Integration** (Week 19)

- [ ] SAML 2.0 support
- [ ] OAuth2/OIDC
- [ ] Active Directory
- [ ] Google Workspace

**Admin Dashboard** (Week 20)

- [ ] Web-based admin panel
- [ ] User management
- [ ] Analytics
- [ ] Billing (if commercial)

---

### Phase 6: Developer Tools (Weeks 21-24)

**CLI Tool** (Week 21)

- [ ] Command-line interface
- [ ] Vault access
- [ ] Item CRUD
- [ ] Import/Export
- [ ] Scripting support

**REST API for Developers** (Week 22)

- [ ] Public API design
- [ ] API key management
- [ ] Rate limiting
- [ ] Documentation

**SDKs** (Week 23)

- [ ] JavaScript/TypeScript SDK
- [ ] Python SDK
- [ ] Go SDK
- [ ] Ruby SDK (optional)

**Integrations** (Week 24)

- [ ] Webhooks
- [ ] CI/CD integration
- [ ] Slack/Discord bots
- [ ] Zapier/Make integration

---

## 🔮 LONG-TERM (Weeks 25-32)

### Phase 7: Advanced Features (Weeks 25-28)

**Passkeys (FIDO2)** (Week 25-26)

- [ ] WebAuthn integration
- [ ] Passkey storage
- [ ] Biometric authentication
- [ ] Hardware security key support

**Advanced Security** (Week 27)

- [ ] Emergency access
- [ ] Trusted contacts
- [ ] Account recovery
- [ ] Dead man's switch

**SSH Key Management** (Week 28)

- [ ] SSH key generation
- [ ] Key storage
- [ ] Agent integration
- [ ] Git integration

---

### Phase 8: Production Launch (Weeks 29-32)

**Security Audit** (Week 29)

- [ ] Third-party security audit
- [ ] Penetration testing
- [ ] Bug bounty program setup
- [ ] Fix critical issues

**Performance & Scale** (Week 30)

- [ ] Load testing
- [ ] Optimization
- [ ] CDN setup
- [ ] Database optimization

**Marketing & Launch** (Week 31)

- [ ] Website
- [ ] Blog
- [ ] Social media
- [ ] Press kit

**Public Launch** (Week 32)

- [ ] Product Hunt
- [ ] Hacker News
- [ ] Reddit
- [ ] Tech blogs

---

## 🐛 BUGS & ISSUES

### Known Issues

- [ ] DTS generation disabled in @passkeyper/core (type conflicts)
- [ ] Import/Export UI not integrated in desktop app
- [ ] Extension native messaging not yet connected
- [ ] TOTP not yet in item detail modal

### Nice to Have

- [ ] Dark/Light theme toggle
- [ ] Custom themes
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)

---

## 📊 TESTING BACKLOG

### Unit Tests Needed

- [ ] @passkeyper/totp tests
- [ ] @passkeyper/io tests
- [ ] @passkeyper/extension tests
- [ ] @passkeyper/api tests

### Integration Tests

- [ ] Desktop app E2E (Playwright)
- [ ] Extension E2E
- [ ] API integration tests
- [ ] Sync flow tests

### Performance Tests

- [ ] Large vault performance (10k+ items)
- [ ] Sync performance
- [ ] Search performance
- [ ] Startup time

---

## 📚 DOCUMENTATION BACKLOG

### Missing Docs

- [ ] Extension installation guide
- [ ] Import/Export guide
- [ ] TOTP setup guide
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Mobile app guides
- [ ] Video tutorials

### Improvements

- [ ] More screenshots
- [ ] GIFs/animations
- [ ] Architecture diagrams
- [ ] Sequence diagrams

---

## 🔒 SECURITY BACKLOG

### Immediate

- [ ] Rate limiting implementation
- [ ] Brute force protection
- [ ] Session timeout
- [ ] CSRF protection

### Future

- [ ] Hardware security key support
- [ ] Yubikey integration
- [ ] Biometric authentication (desktop)
- [ ] Zero-knowledge proofs

---

## 🎨 UI/UX BACKLOG

### Desktop App

- [ ] Drag & drop for items
- [ ] Bulk operations
- [ ] Advanced search filters
- [ ] Item templates
- [ ] Custom categories

### Extension

- [ ] Better form detection
- [ ] Multi-step form support
- [ ] Credit card autofill
- [ ] Identity autofill
- [ ] Custom field mapping

### Mobile

- [ ] Tablet optimization
- [ ] Landscape mode
- [ ] Widgets
- [ ] Watch app (Apple Watch)

---

## 💡 FEATURE IDEAS

### Community Requests

- [ ] Password breach monitoring (HIBP)
- [ ] Secure notes
- [ ] File attachments
- [ ] Password expiration warnings
- [ ] Login activity tracking

### Innovation

- [ ] AI-powered password suggestions
- [ ] Smart duplicate detection
- [ ] Password strength AI
- [ ] Phishing detection
- [ ] Auto-categorization

---

## 🚢 DEPLOYMENT BACKLOG

### Infrastructure

- [ ] CI/CD pipeline refinement
- [ ] Automated testing in CI
- [ ] Code signing setup
- [ ] Distribution (app stores)

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics (privacy-friendly)
- [ ] Performance monitoring
- [ ] Uptime monitoring

### Backup & Recovery

- [ ] Automated backups
- [ ] Disaster recovery plan
- [ ] Data retention policy
- [ ] GDPR compliance

---

## 📅 RELEASE SCHEDULE

### Next Releases

**v0.2.0 (Phase 2 Complete)**

- Target: 2-3 weeks
- Features: Extension complete, TOTP UI, Import/Export UI

**v0.3.0 (Phase 3 Complete)**

- Target: 6-8 weeks
- Features: Cloud sync, multi-device

**v0.4.0 (Phase 4 Complete)**

- Target: 12-14 weeks
- Features: Mobile apps

**v0.5.0 (Phase 5 Complete)**

- Target: 18-20 weeks
- Features: Team features

**v1.0.0 (Public Launch)**

- Target: 30-32 weeks
- Features: All phases complete, audited, polished

---

## ✅ COMPLETED (For Reference)

### Phase 1 (100%)

- [x] Desktop password manager
- [x] Encryption (AES-256-GCM + Argon2id)
- [x] Password generator
- [x] Vault management
- [x] Item CRUD
- [x] Search & favorites
- [x] Auto-lock
- [x] Settings
- [x] Keyboard shortcuts
- [x] Toast notifications

### Phase 2 (52.5%)

- [x] TOTP generator (RFC 6238)
- [x] Import from 6 formats
- [x] Export (CSV, JSON encrypted)
- [x] Browser extension structure
- [x] Extension popup UI
- [x] Form detection

### Phase 3 (30%)

- [x] REST API server
- [x] WebSocket sync
- [x] Database schema
- [x] Authentication API
- [x] Vault CRUD API
- [x] Sync protocol

---

**Last Updated**: 2025-12-27 23:55  
**Current Focus**: Complete Phase 2 & 3  
**Next Major Milestone**: v0.2.0 (Phase 2 complete)

---

*This TODO is a living document. Update as priorities change.*
