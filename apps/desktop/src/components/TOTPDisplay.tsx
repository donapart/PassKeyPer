/**
 * TOTP Display Component
 * Shows TOTP code with countdown timer
 */

import React, { useEffect, useState } from 'react'
import { Copy, Check, Clock, RefreshCw } from 'lucide-react'
import { generateTOTP, type TOTPToken, type TOTPConfig } from '@passkeyper/totp'

interface TOTPDisplayProps {
    config: TOTPConfig
    onCopy?: () => void
}

export function TOTPDisplay({ config, onCopy }: TOTPDisplayProps) {
    const [token, setToken] = useState<TOTPToken | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Generate initial token
        updateToken()

        // Update every second
        const interval = setInterval(updateToken, 1000)

        return () => clearInterval(interval)
    }, [config])

    const updateToken = () => {
        const newToken = generateTOTP(config)
        setToken(newToken)
    }

    const handleCopy = async () => {
        if (!token) return

        await navigator.clipboard.writeText(token.token)
        setCopied(true)
        onCopy?.()

        setTimeout(() => setCopied(false), 2000)
    }

    if (!token) {
        return (
            <div className="totp-loading">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating code...</span>
            </div>
        )
    }

    // Format token: 123 456
    const formattedToken = token.token.replace(/(\d{3})(\d{3})/, '$1 $2')

    // Progress percentage
    const progress = ((config.period || 30) - token.remainingTime) / (config.period || 30) * 100

    // Color based on remaining time
    const getColor = () => {
        if (token.remainingTime <= 5) return 'text-red-400'
        if (token.remainingTime <= 10) return 'text-yellow-400'
        return 'text-green-400'
    }

    return (
        <div className="totp-container">
            {/* Code Display */}
            <div className="totp-code-wrapper">
                <div className={`totp-code ${getColor()}`}>
                    {formattedToken}
                </div>

                <button
                    onClick={handleCopy}
                    className="totp-copy-btn"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Timer & Progress */}
            <div className="totp-timer">
                <div className="timer-info">
                    <Clock className="w-3 h-3" />
                    <span className={getColor()}>{token.remainingTime}s</span>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: token.remainingTime <= 5 ? '#f87171' :
                                token.remainingTime <= 10 ? '#fbbf24' : '#4ade80'
                        }}
                    />
                </div>
            </div>

            {/* Issuer */}
            {config.issuer && (
                <div className="totp-issuer">
                    {config.issuer}
                </div>
            )}
        </div>
    )
}

/**
 * TOTP Setup Component
 * For adding new TOTP
 */

interface TOTPSetupProps {
    onAdd: (config: TOTPConfig) => void
    onCancel: () => void
}

export function TOTPSetup({ onAdd, onCancel }: TOTPSetupProps) {
    const [secret, setSecret] = useState('')
    const [issuer, setIssuer] = useState('')
    const [uri, setUri] = useState('')
    const [error, setError] = useState('')

    const handleAddManual = () => {
        if (!secret) {
            setError('Secret is required')
            return
        }

        onAdd({
            secret,
            issuer: issuer || undefined,
        })
    }

    const handleAddFromUri = () => {
        if (!uri) {
            setError('URI is required')
            return
        }

        try {
            // TODO: Parse URI
            // For now, show error
            setError('URI parsing coming soon')
        } catch (err) {
            setError('Invalid TOTP URI')
        }
    }

    return (
        <div className="totp-setup">
            <h3>Add TOTP Authenticator</h3>

            {/* Manual Entry */}
            <div className="setup-section">
                <label className="label">Secret Key</label>
                <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter secret key (base32)"
                    className="input"
                />
            </div>

            <div className="setup-section">
                <label className="label">Issuer (optional)</label>
                <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g., Google, GitHub"
                    className="input"
                />
            </div>

            {/* OR */}
            <div className="divider">OR</div>

            {/* URI Entry */}
            <div className="setup-section">
                <label className="label">TOTP URI</label>
                <input
                    type="text"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    placeholder="otpauth://totp/..."
                    className="input"
                />
            </div>

            {/* QR Code Scanner (Future) */}
            <div className="setup-section">
                <button className="btn-secondary" disabled>
                    📷 Scan QR Code (Coming Soon)
                </button>
            </div>

            {/*Error */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="setup-actions">
                <button onClick={onCancel} className="btn-ghost">
                    Cancel
                </button>
                <button onClick={handleAddManual} className="btn-primary">
                    Add TOTP
                </button>
            </div>
        </div>
    )
}
