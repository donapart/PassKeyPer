/**
 * TOTP (Time-based One-Time Password) Generator
 * RFC 6238 implementation for 2FA codes
 */

import * as OTPAuth from 'otpauth'

export interface TOTPConfig {
    /** Secret key (base32 encoded) */
    secret: string
    /** Issuer name (e.g., "Google", "GitHub") */
    issuer?: string
    /** Account name (e.g., email address) */
    label?: string
    /** Token algorithm (default: SHA1) */
    algorithm?: 'SHA1' | 'SHA256' | 'SHA512'
    /** Token digits (default: 6) */
    digits?: number
    /** Time step in seconds (default: 30) */
    period?: number
}

export interface TOTPToken {
    /** Current 6-digit code */
    token: string
    /** Seconds until next code */
    remainingTime: number
    /** Current period */
    period: number
}

/**
 * Generate TOTP token from secret
 */
export function generateTOTP(config: TOTPConfig): TOTPToken {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label,
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    })

    const token = totp.generate()
    const now = Math.floor(Date.now() / 1000)
    const period = config.period || 30
    const remainingTime = period - (now % period)

    return {
        token,
        remainingTime,
        period: Math.floor(now / period),
    }
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(config: TOTPConfig, token: string, window: number = 1): boolean {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label,
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    })

    const delta = totp.validate({ token, window })
    return delta !== null
}

/**
 * Parse TOTP URI (otpauth://totp/...)
 */
export function parseTOTPUri(uri: string): TOTPConfig {
    try {
        const totp = OTPAuth.URI.parse(uri)

        if (!(totp instanceof OTPAuth.TOTP)) {
            throw new Error('Invalid TOTP URI')
        }

        return {
            secret: totp.secret.base32,
            issuer: totp.issuer,
            label: totp.label,
            algorithm: totp.algorithm as 'SHA1' | 'SHA256' | 'SHA512',
            digits: totp.digits,
            period: totp.period,
        }
    } catch (error) {
        throw new Error('Failed to parse TOTP URI: ' + (error as Error).message)
    }
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPUri(config: TOTPConfig): string {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label || 'user@example.com',
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    })

    return totp.toString()
}

/**
 * Generate secure random secret (base32)
 */
export function generateTOTPSecret(length: number = 32): string {
    const secret = OTPAuth.Secret.fromUTF8(generateRandomBytes(length))
    return secret.base32
}

/**
 * Generate random bytes
 */
function generateRandomBytes(length: number): string {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => String.fromCharCode(b)).join('')
}

/**
 * Get progress for current TOTP period (0-1)
 */
export function getTOTPProgress(period: number = 30): number {
    const now = Math.floor(Date.now() / 1000)
    const elapsed = now % period
    return elapsed / period
}

/**
 * Watch TOTP and call callback when it changes
 */
export function watchTOTP(
    config: TOTPConfig,
    callback: (token: TOTPToken) => void
): () => void {
    let intervalId: NodeJS.Timeout

    const update = () => {
        const token = generateTOTP(config)
        callback(token)
    }

    // Initial call
    update()

    // Update every second
    intervalId = setInterval(update, 1000)

    // Return cleanup function
    return () => clearInterval(intervalId)
}
