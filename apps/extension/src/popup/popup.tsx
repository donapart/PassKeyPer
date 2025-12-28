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

function Popup() {
    const [isLocked, setIsLocked] = useState(true)
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentUrl, setCurrentUrl] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get current tab URL
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0]?.url) {
                setCurrentUrl(tabs[0].url)
            }
        })

        // Check if desktop app is running
        checkDesktopApp()
    }, [])

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
        // TODO: Show toast notification
        console.log(`Copied ${field}`)
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
                    <h1>🔐 PassKeyPer</h1>
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
                    <h1>🔐 PassKeyPer</h1>
                </div>
                <div className="popup-locked">
                    <div className="lock-icon">🔒</div>
                    <h2>Desktop App Required</h2>
                    <p>Please open the PassKeyPer desktop app to use the extension.</p>
                    <button onClick={openDesktopApp} className="btn-primary">
                        Open Desktop App
                    </button>
                    <a
                        href="https://github.com/yourusername/passkeyper"
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
            {/* Header */}
            <div className="popup-header">
                <h1>🔐 PassKeyPer</h1>
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
                                    onClick={() => handleCopy(cred.username, 'username')}
                                >
                                    👤
                                </button>
                                <button
                                    className="icon-btn"
                                    title="Copy password"
                                    onClick={() => handleCopy('[password]', 'password')}
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

            {/* Footer */}
            <div className="popup-footer">
                <a href="#" className="footer-link">
                    ⚙️ Settings
                </a>
                <a href="#" className="footer-link">
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
