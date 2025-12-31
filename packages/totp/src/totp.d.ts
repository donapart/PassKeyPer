/**
 * TOTP (Time-based One-Time Password) Generator
 * RFC 6238 implementation for 2FA codes
 */
export interface TOTPConfig {
    /** Secret key (base32 encoded) */
    secret: string;
    /** Issuer name (e.g., "Google", "GitHub") */
    issuer?: string;
    /** Account name (e.g., email address) */
    label?: string;
    /** Token algorithm (default: SHA1) */
    algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
    /** Token digits (default: 6) */
    digits?: number;
    /** Time step in seconds (default: 30) */
    period?: number;
}
export interface TOTPToken {
    /** Current 6-digit code */
    token: string;
    /** Seconds until next code */
    remainingTime: number;
    /** Current period */
    period: number;
}
/**
 * Generate TOTP token from secret
 */
export declare function generateTOTP(config: TOTPConfig): TOTPToken;
/**
 * Verify TOTP token
 */
export declare function verifyTOTP(config: TOTPConfig, token: string, window?: number): boolean;
/**
 * Parse TOTP URI (otpauth://totp/...)
 */
export declare function parseTOTPUri(uri: string): TOTPConfig;
/**
 * Generate TOTP URI for QR code
 */
export declare function generateTOTPUri(config: TOTPConfig): string;
/**
 * Generate secure random secret (base32)
 */
export declare function generateTOTPSecret(length?: number): string;
/**
 * Get progress for current TOTP period (0-1)
 */
export declare function getTOTPProgress(period?: number): number;
/**
 * Watch TOTP and call callback when it changes
 */
export declare function watchTOTP(config: TOTPConfig, callback: (token: TOTPToken) => void): () => void;
//# sourceMappingURL=totp.d.ts.map