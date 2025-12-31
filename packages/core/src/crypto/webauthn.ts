/**
 * WebAuthn/Passkey Support Module
 * 
 * Implements passwordless authentication using FIDO2 WebAuthn
 * 
 * @module @passkeyper/core/webauthn
 */

import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from './types'

/**
 * Check if WebAuthn is available in the current environment
 */
export function isWebAuthnAvailable(): boolean {
  return typeof window !== 'undefined' &&
    'credentials' in navigator &&
    'PublicKeyCredential' in window
}

/**
 * Check if platform authenticator (biometrics) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/**
 * Check if conditional UI (autofill) is available
 */
export async function isConditionalMediationAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false
  
  try {
    // @ts-expect-error - Conditional mediation not in all TypeScript versions
    return await PublicKeyCredential.isConditionalMediationAvailable?.() ?? false
  } catch {
    return false
  }
}

/**
 * Convert base64url string to ArrayBuffer
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64url.length % 4) % 4)
  const base64 = (base64url + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = atob(base64)
  const buffer = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i)
  }
  return buffer.buffer
}

/**
 * Convert ArrayBuffer to base64url string
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Create WebAuthn credential options from server response
 */
export function parseCreationOptions(options: PublicKeyCredentialCreationOptionsJSON): PublicKeyCredentialCreationOptions {
  return {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToBuffer(options.user.id)
    },
    excludeCredentials: options.excludeCredentials?.map(cred => ({
      ...cred,
      id: base64urlToBuffer(cred.id)
    }))
  }
}

/**
 * Create WebAuthn request options from server response
 */
export function parseRequestOptions(options: PublicKeyCredentialRequestOptionsJSON): PublicKeyCredentialRequestOptions {
  return {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map(cred => ({
      ...cred,
      id: base64urlToBuffer(cred.id)
    }))
  }
}

/**
 * Register a new passkey
 */
export async function registerPasskey(
  options: PublicKeyCredentialCreationOptionsJSON
): Promise<{ id: string; rawId: string; response: { clientDataJSON: string; attestationObject: string }; type: string }> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not available in this environment')
  }

  const credential = await navigator.credentials.create({
    publicKey: parseCreationOptions(options)
  }) as PublicKeyCredential

  if (!credential) {
    throw new Error('Failed to create credential')
  }

  const response = credential.response as AuthenticatorAttestationResponse

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject)
    },
    type: credential.type
  }
}

/**
 * Authenticate with a passkey
 */
export async function authenticateWithPasskey(
  options: PublicKeyCredentialRequestOptionsJSON,
  conditional?: boolean
): Promise<{ id: string; rawId: string; response: { clientDataJSON: string; authenticatorData: string; signature: string; userHandle?: string }; type: string }> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not available in this environment')
  }

  const credentialOptions: CredentialRequestOptions = {
    publicKey: parseRequestOptions(options),
    // @ts-expect-error - Conditional mediation
    mediation: conditional ? 'conditional' : undefined
  }

  const credential = await navigator.credentials.get(credentialOptions) as PublicKeyCredential

  if (!credential) {
    throw new Error('Failed to get credential')
  }

  const response = credential.response as AuthenticatorAssertionResponse

  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : undefined
    },
    type: credential.type
  }
}

/**
 * Abort any ongoing WebAuthn operation
 */
let abortController: AbortController | null = null

export function abortWebAuthn(): void {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

/**
 * Create passkey creation options for sending to WebAuthn API
 */
export function createPasskeyOptions(
  userId: string,
  userName: string,
  userDisplayName: string,
  rpName: string = 'PassKeyPer',
  rpId?: string
): PublicKeyCredentialCreationOptionsJSON {
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)

  return {
    challenge: bufferToBase64url(challenge.buffer),
    rp: {
      name: rpName,
      id: rpId || window.location.hostname
    },
    user: {
      id: bufferToBase64url(new TextEncoder().encode(userId)),
      name: userName,
      displayName: userDisplayName
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }  // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required'
    },
    attestation: 'none',
    timeout: 60000
  }
}
