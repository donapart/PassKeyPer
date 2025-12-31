/**
 * Password Generator
 *
 * Generate cryptographically secure passwords and passphrases
 */
import type { PasswordGeneratorOptions, PassphraseGeneratorOptions, PasswordStrength } from '../types';
/**
 * Generate a random password with specified options
 *
 * @param options - Password generation options
 * @returns Cryptographically secure random password
 */
export declare function generatePassword(options: PasswordGeneratorOptions): string;
/**
 * Generate a passphrase (Diceware-style)
 *
 * @param options - Passphrase generation options
 * @returns Random passphrase
 */
export declare function generatePassphrase(options: PassphraseGeneratorOptions): string;
/**
 * Calculate password strength
 *
 * @param password - Password to analyze
 * @returns Strength analysis
 */
export declare function calculateStrength(password: string): PasswordStrength;
/**
 * Check if password is in common password list (basic check)
 * In production, use a comprehensive list like the top 100k passwords
 *
 * @param password - Password to check
 * @returns True if password is common
 */
export declare function isCommonPassword(password: string): boolean;
//# sourceMappingURL=password-generator.d.ts.map