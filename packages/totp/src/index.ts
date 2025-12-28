/**
 * @passkeyper/totp
 * 
 * TOTP/2FA authenticator
 */

export {
    generateTOTP,
    verifyTOTP,
    parseTOTPUri,
    generateTOTPUri,
    generateTOTPSecret,
    getTOTPProgress,
    watchTOTP,
} from './totp'

export type {
    TOTPConfig,
    TOTPToken,
} from './totp'
