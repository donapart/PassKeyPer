# Contributing to PassKeyPer

Thank you for your interest in contributing to PassKeyPer! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Report Bugs**: Open an issue with detailed reproduction steps
- **Suggest Features**: Propose new features or improvements
- **Submit Pull Requests**: Fix bugs or implement features
- **Improve Documentation**: Help make docs clearer and more comprehensive
- **Write Tests**: Increase test coverage
- **Review Code**: Provide feedback on open PRs
- **Spread the Word**: Share PassKeyPer with others

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (with npm)
- Git
- Windows, macOS, or Linux

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/passkeyper.git
cd passkeyper

# 2. Install dependencies
npm install

# 3. Build packages
npm run build

# 4. Run desktop app in development mode
cd apps/desktop
npm run electron:dev
```

## 📁 Project Structure

```
passkeyper/
├── packages/
│   ├── core/          # Cryptography library
│   ├── storage/       # Local vault storage
│   └── ui-components/ # Shared React components (future)
├── apps/
│   ├── desktop/       # Electron desktop app
│   ├── mobile/        # React Native app (future)
│   ├── extension/     # Browser extension (future)
│   └── cli/           # CLI tool (future)
├── services/
│   ├── api/           # REST API (future)
│   └── sync/          # Sync service (future)
└── docs/              # Documentation
```

## 🔧 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring
- `test/what-added` - Test additions

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run unit tests
cd packages/core
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add TOTP authenticator support"
git commit -m "fix: resolve encryption key derivation issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor: simplify vault storage logic"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/amazing-feature
```

Then open a Pull Request on GitHub with:

- Clear title describing the change
- Detailed description of what and why
- Screenshots/GIFs for UI changes
- Reference related issues (e.g., "Closes #123")

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Add type annotations for function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

```typescript
// ✅ Good
async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // ...
}

// ❌ Bad
async function derive(p: any, s: any): Promise<any> {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  )
}
```

### File Organization

- One component per file
- Group related files in folders
- Use index.ts for clean exports

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
```

## 🧪 Testing Guidelines

### Unit Tests

- Test pure functions thoroughly
- Mock external dependencies
- Use descriptive test names

```typescript
describe('deriveEncryptionKey', () => {
  it('should derive 32-byte key from password and salt', async () => {
    const password = 'test-password'
    const salt = generateSalt()
    
    const key = await deriveEncryptionKey(password, salt)
    
    expect(key.length).toBe(32)
  })
  
  it('should derive same key for same inputs', async () => {
    const password = 'test-password'
    const salt = generateSalt()
    
    const key1 = await deriveEncryptionKey(password, salt)
    const key2 = await deriveEncryptionKey(password, salt)
    
    expect(key1).toEqual(key2)
  })
})
```

### Integration Tests

- Test component interactions
- Test API endpoints
- Test user workflows

### E2E Tests (Future)

- Test complete user journeys
- Test across different platforms
- Use Playwright or similar

## 🔒 Security Guidelines

### DO

✅ Use cryptographically secure random number generators
✅ Validate all user inputs
✅ Use parameterized queries for database
✅ Encrypt sensitive data before storage
✅ Log security events
✅ Keep dependencies updated

### DON'T

❌ Store passwords in plaintext
❌ Use weak encryption algorithms
❌ Expose sensitive data in logs
❌ Trust client-side input
❌ Hardcode secrets
❌ Disable security features

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities!

Instead, email <security@passkeyper.com> with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Explain complex algorithms
- Document edge cases

```typescript
/**
 * Derives an encryption key from a master password using Argon2id
 * 
 * @param password - Master password (UTF-8 string)
 * @param salt - Unique salt (32 bytes)
 * @param iterations - Number of iterations (default: 3)
 * @returns 32-byte encryption key
 * 
 * @throws {Error} If password is empty or salt is invalid
 * 
 * @example
 * const salt = generateSalt()
 * const key = await deriveMasterKey('my-password', salt, 3)
 */
```

### README Updates

- Update feature lists when adding features
- Add usage examples
- Keep screenshots current

## 🎨 UI/UX Guidelines

### Design Principles

- **Clarity**: Make it obvious what everything does
- **Consistency**: Use patterns users expect
- **Feedback**: Always show what's happening
- **Safety**: Confirm destructive actions
- **Speed**: Show loading states, optimize performance

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Support keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

### Dark Theme

PassKeyPer uses a dark theme by default. When adding UI:

- Use Tailwind dark theme colors
- Ensure sufficient contrast
- Test in different lighting conditions

## 🐛 Bug Reports

Good bug reports include:

1. **Clear Title**: Describe the issue concisely
2. **Environment**: OS, Node version, app version
3. **Steps to Reproduce**: Numbered list
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Error Messages**: Full stack traces
8. **Additional Context**: Anything else relevant

Template:

```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: Windows 11
- Node: v18.17.0
- App Version: v0.1.0

## Steps to Reproduce
1. Open app
2. Click on 'New Item'
3. Enter password
4. Click 'Save'

## Expected
Item should be saved successfully

## Actual
App crashes with error: "..."

## Screenshots
[Attach screenshot]

## Additional Context
This only happens when...
```

## 💡 Feature Requests

Good feature requests include:

1. **Problem Statement**: What problem does it solve?
2. **Proposed Solution**: How would it work?
3. **Alternatives**: Other solutions considered
4. **Use Cases**: Real-world scenarios
5. **Mockups**: If UI-related

## 📊 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] PR description is clear and detailed

## 🏆 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commit history

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Chat**: Join our Discord (coming soon)
- **Email**: <hello@passkeyper.com>

## 📜 License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 license.

---

Thank you for contributing to PassKeyPer! 🎉
