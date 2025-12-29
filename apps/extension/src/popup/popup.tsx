/**
 * Browser Extension Popup
 * Main interface for the PassKeyPer extension
 */

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import browser from 'webextension-polyfill'
import './popup.css'

interface Credential {
    id: string
    name: string
    username: string
    url: string
}

type Tab = 'credentials' | 'generator' | 'settings'

function Popup() {
    const [isLocked, setIsLocked] = useState(true)
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentUrl, setCurrentUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('credentials')
    const [toast, setToast] = useState<string | null>(null)

    // Generator state
    const [password, setPassword] = useState('')
    const [length, setLength] = useState(16)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    })

    useEffect(() => {
        // Get current tab URL
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0]?.url) {
                setCurrentUrl(tabs[0].url)
            }
        })

        // Check if desktop app is running
        checkDesktopApp()
        generatePassword()
    }, [])

    useEffect(() => {
        generatePassword()
    }, [length, options])

    const showToast = (message: string) => {
        setToast(message)
        setTimeout(() => setToast(null), 2000)
    }

    const generatePassword = () => {
        let chars = ''
        if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
        if (options.numbers) chars += '0123456789'
        if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

        if (chars.length === 0) {
            setPassword('')
            return
        }

        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(result)
    }

    const getPasswordStrength = () => {
        let score = 0
        if (password.length >= 8) score++
        if (password.length >= 12) score++
        if (password.length >= 16) score++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^a-zA-Z0-9]/.test(password)) score++
        return Math.min(score, 5)
    }

    const getStrengthColor = () => {
        const strength = getPasswordStrength()
        if (strength <= 1) return '#ef4444'
        if (strength <= 2) return '#f97316'
        if (strength <= 3) return '#eab308'
        if (strength <= 4) return '#22c55e'
        return '#10b981'
    }

    const getStrengthLabel = () => {
        const strength = getPasswordStrength()
        if (strength <= 1) return 'Weak'
        if (strength <= 2) return 'Fair'
        if (strength <= 3) return 'Good'
        if (strength <= 4) return 'Strong'
        return 'Excellent'
    }

    const checkDesktopApp = async () => {
        try {
            // Send message to desktop app via native messaging
            const response = await browser.runtime.sendNativeMessage('com.passkeyper.native', {
                type: 'PING'
            })

            if (response.success) {
                setIsLocked(false)
                loadCredentials()
            }
        } catch (error) {
            console.error('Desktop app not running:', error)
            setLoading(false)
        }
    }

    const loadCredentials = async () => {
        setLoading(true)
        try {
            const response = await browser.runtime.sendMessage({
                type: 'GET_CREDENTIALS',
                payload: { url: currentUrl }
            })

            if (response.success) {
                setCredentials(response.credentials || [])
            }
        } catch (error) {
            console.error('Failed to load credentials:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFill = async (credential: Credential) => {
        // Send to content script
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                type: 'FILL_CREDENTIALS',
                payload: credential
            })
            window.close()
        }
    }

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        showToast(`${field} copied!`)
    }

    const openDesktopApp = () => {
        // Send message to open desktop app
        browser.runtime.sendNativeMessage('com.passkeyper.native', {
            type: 'OPEN_APP'
        })
    }

    const filteredCredentials = credentials.filter((cred) =>
        cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="popup">
                <div className="popup-header">
                    <div className="header-brand">
                        <span className="logo">🔐</span>
                        <h1>PassKeyPer</h1>
                    </div>
                </div>
                <div className="popup-loading">
                    <div className="spinner" />
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    if (isLocked) {
        return (
            <div className="popup">
                <div className="popup-header">
                    <div className="header-brand">
                        <span className="logo">🔐</span>
                        <h1>PassKeyPer</h1>
                    </div>
                </div>
                <div className="popup-locked">
                    <div className="lock-icon">🔒</div>
                    <h2>Desktop App Required</h2>
                    <p>Please open the PassKeyPer desktop app to use the extension.</p>
                    <button onClick={openDesktopApp} className="btn-primary">
                        Open Desktop App
                    </button>
                    <a
                        href="https://github.com/donapart/PassKeyPer"
                        target="_blank"
                        className="link"
                    >
                        Download Desktop App
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="popup">
            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}

            {/* Header */}
            <div className="popup-header">
                <div className="header-brand">
                    <span className="logo">🔐</span>
                    <h1>PassKeyPer</h1>
                </div>
                <div className="header-actions">
                    <button
                        className="icon-btn"
                        title="Open Desktop App"
                        onClick={openDesktopApp}
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'credentials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('credentials')}
                >
                    🔑 Passwords
                </button>
                <button
                    className={`tab ${activeTab === 'generator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('generator')}
                >
                    🎲 Generator
                </button>
            </div>

            {/* Content */}
            <div className="popup-content">
                {activeTab === 'credentials' && (
                    <>
                        {/* Current Site */}
                        {currentUrl && (
                            <div className="current-site">
                                <span className="site-icon">🌐</span>
                                <span className="site-url">{new URL(currentUrl).hostname}</span>
                            </div>
                        )}

                        {/* Search */}
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search credentials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Credentials List */}
                        <div className="credentials-list">
                            {filteredCredentials.length === 0 ? (
                                <div className="empty-state">
                                    <p>No credentials found</p>
                                    <button onClick={openDesktopApp} className="btn-secondary">
                                        Add New in Desktop App
                                    </button>
                                </div>
                            ) : (
                                filteredCredentials.map((cred) => (
                                    <div key={cred.id} className="credential-item">
                                        <div className="credential-info">
                                            <div className="credential-name">{cred.name}</div>
                                            <div className="credential-username">{cred.username}</div>
                                        </div>
                                        <div className="credential-actions">
                                            <button
                                                className="icon-btn"
                                                title="Copy username"
                                                onClick={() => handleCopy(cred.username, 'Username')}
                                            >
                                                👤
                                            </button>
                                            <button
                                                className="icon-btn"
                                                title="Copy password"
                                                onClick={() => handleCopy('[password]', 'Password')}
                                            >
                                                🔑
                                            </button>
                                            <button
                                                className="btn-fill"
                                                onClick={() => handleFill(cred)}
                                            >
                                                Fill
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'generator' && (
                    <div className="generator-tab">
                        {/* Generated Password */}
                        <div className="password-display">
                            <span className="password-text">{password || 'Generate a password'}</span>
                            <div className="password-actions">
                                <button
                                    className="icon-btn"
                                    onClick={() => handleCopy(password, 'Password')}
                                    title="Copy"
                                >
                                    📋
                                </button>
                                <button
                                    className="icon-btn"
                                    onClick={generatePassword}
                                    title="Regenerate"
                                >
                                    🔄
                                </button>
                            </div>
                        </div>

                        {/* Strength */}
                        <div className="strength-bar">
                            <div className="strength-segments">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="strength-segment"
                                        style={{
                                            backgroundColor: i < getPasswordStrength() ? getStrengthColor() : '#334155'
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="strength-label" style={{ color: getStrengthColor() }}>
                                {getStrengthLabel()}
                            </span>
                        </div>

                        {/* Length */}
                        <div className="option-row">
                            <span>Length: {length}</span>
                            <input
                                type="range"
                                min="8"
                                max="32"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="slider"
                            />
                        </div>

                        {/* Options */}
                        <div className="options-grid">
                            <label className="option-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.uppercase}
                                    onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                                />
                                <span>A-Z</span>
                            </label>
                            <label className="option-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.lowercase}
                                    onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                                />
                                <span>a-z</span>
                            </label>
                            <label className="option-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.numbers}
                                    onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                                />
                                <span>0-9</span>
                            </label>
                            <label className="option-toggle">
                                <input
                                    type="checkbox"
                                    checked={options.symbols}
                                    onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                                />
                                <span>!@#</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="popup-footer">
                <span className="footer-status">
                    <span className="status-dot connected" /> Connected
                </span>
                <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); openDesktopApp() }}>
                    🔒 Lock
                </a>
            </div>
        </div>
    )
}

// Mount
const root = document.getElementById('root')
if (root) {
    ReactDOM.createRoot(root).render(<Popup />)
}
