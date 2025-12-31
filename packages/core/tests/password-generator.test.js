import { describe, it, expect } from 'vitest';
import { generatePassword, generatePassphrase, calculateStrength, isCommonPassword, } from '../src/crypto/password-generator';
describe('Password Generator', () => {
    it('should generate password with correct length', () => {
        const password = generatePassword({
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: false,
        });
        expect(password.length).toBe(16);
    });
    it('should generate password with only lowercase', () => {
        const password = generatePassword({
            length: 20,
            includeUppercase: false,
            includeLowercase: true,
            includeNumbers: false,
            includeSymbols: false,
            excludeAmbiguous: false,
        });
        expect(password).toMatch(/^[a-z]+$/);
    });
    it('should generate password with all character types', () => {
        const password = generatePassword({
            length: 32,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: false,
        });
        expect(password).toMatch(/[A-Z]/); // Has uppercase
        expect(password).toMatch(/[a-z]/); // Has lowercase
        expect(password).toMatch(/[0-9]/); // Has numbers
        expect(password).toMatch(/[^A-Za-z0-9]/); // Has symbols
    });
    it('should exclude ambiguous characters', () => {
        const password = generatePassword({
            length: 100,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: false,
            excludeAmbiguous: true,
        });
        // Should not contain i, l, 1, L, o, 0, O
        expect(password).not.toMatch(/[il1Lo0O]/);
    });
    it('should generate different passwords each time', () => {
        const options = {
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: false,
        };
        const password1 = generatePassword(options);
        const password2 = generatePassword(options);
        expect(password1).not.toBe(password2);
    });
    it('should generate passphrase', () => {
        const passphrase = generatePassphrase({
            wordCount: 4,
            separator: '-',
            capitalize: false,
            includeNumber: false,
        });
        const words = passphrase.split('-');
        expect(words.length).toBe(4);
    });
    it('should capitalize passphrase words', () => {
        const passphrase = generatePassphrase({
            wordCount: 3,
            separator: '-',
            capitalize: true,
            includeNumber: false,
        });
        const words = passphrase.split('-');
        words.forEach(word => {
            expect(word[0]).toMatch(/[A-Z]/);
        });
    });
    it('should include number in passphrase', () => {
        const passphrase = generatePassphrase({
            wordCount: 4,
            separator: '-',
            capitalize: false,
            includeNumber: true,
        });
        expect(passphrase).toMatch(/\d{4}$/);
    });
    it('should calculate password strength', () => {
        const weakPassword = '12345';
        const strongPassword = 'Xy7$mK#9pQw!nR2@';
        const weakStrength = calculateStrength(weakPassword);
        const strongStrength = calculateStrength(strongPassword);
        expect(weakStrength.score).toBeLessThan(50);
        expect(strongStrength.score).toBeGreaterThan(70);
        expect(strongStrength.entropy).toBeGreaterThan(weakStrength.entropy);
    });
    it('should provide warnings for weak passwords', () => {
        const password = 'abc';
        const strength = calculateStrength(password);
        expect(strength.warnings.length).toBeGreaterThan(0);
        expect(strength.suggestions.length).toBeGreaterThan(0);
    });
    it('should detect common passwords', () => {
        expect(isCommonPassword('password')).toBe(true);
        expect(isCommonPassword('123456')).toBe(true);
        expect(isCommonPassword('Xy7$mK#9pQw!nR2@')).toBe(false);
    });
    it('should calculate high entropy for long mixed passwords', () => {
        const password = generatePassword({
            length: 32,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: false,
        });
        const strength = calculateStrength(password);
        expect(strength.entropy).toBeGreaterThan(100);
        expect(strength.score).toBeGreaterThan(80);
    });
});
//# sourceMappingURL=password-generator.test.js.map