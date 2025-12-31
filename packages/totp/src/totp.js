/**
 * TOTP (Time-based One-Time Password) Generator
 * RFC 6238 implementation for 2FA codes
 */
import * as OTPAuth from 'otpauth';
/**
 * Generate TOTP token from secret
 */
export function generateTOTP(config) {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label,
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    });
    const token = totp.generate();
    const now = Math.floor(Date.now() / 1000);
    const period = config.period || 30;
    const remainingTime = period - (now % period);
    return {
        token,
        remainingTime,
        period: Math.floor(now / period),
    };
}
/**
 * Verify TOTP token
 */
export function verifyTOTP(config, token, window = 1) {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label,
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    });
    const delta = totp.validate({ token, window });
    return delta !== null;
}
/**
 * Parse TOTP URI (otpauth://totp/...)
 */
export function parseTOTPUri(uri) {
    try {
        const totp = OTPAuth.URI.parse(uri);
        if (!(totp instanceof OTPAuth.TOTP)) {
            throw new Error('Invalid TOTP URI');
        }
        return {
            secret: totp.secret.base32,
            issuer: totp.issuer,
            label: totp.label,
            algorithm: totp.algorithm,
            digits: totp.digits,
            period: totp.period,
        };
    }
    catch (error) {
        throw new Error('Failed to parse TOTP URI: ' + error.message);
    }
}
/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPUri(config) {
    const totp = new OTPAuth.TOTP({
        issuer: config.issuer,
        label: config.label || 'user@example.com',
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
        secret: config.secret,
    });
    return totp.toString();
}
/**
 * Generate secure random secret (base32)
 */
export function generateTOTPSecret(length = 32) {
    const secret = OTPAuth.Secret.fromUTF8(generateRandomBytes(length));
    return secret.base32;
}
/**
 * Generate random bytes
 */
function generateRandomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => String.fromCharCode(b)).join('');
}
/**
 * Get progress for current TOTP period (0-1)
 */
export function getTOTPProgress(period = 30) {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now % period;
    return elapsed / period;
}
/**
 * Watch TOTP and call callback when it changes
 */
export function watchTOTP(config, callback) {
    let intervalId;
    const update = () => {
        const token = generateTOTP(config);
        callback(token);
    };
    // Initial call
    update();
    // Update every second
    intervalId = setInterval(update, 1000);
    // Return cleanup function
    return () => clearInterval(intervalId);
}
//# sourceMappingURL=totp.js.map