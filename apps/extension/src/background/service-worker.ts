/**
 * Browser Extension Background Service Worker
 * Handles extension lifecycle, messaging, and native app communication
 */

import browser from 'webextension-polyfill'
import { nativeMessaging, getCredentials, saveCredentials, pingDesktop } from './native-messaging'

console.log('PassKeyPer background service worker loaded')

// Connect to desktop app on startup
nativeMessaging.connect()

// Check connection status
pingDesktop().then(connected => {
    if (connected) {
        console.log('✓ Desktop app connected')
    } else {
        console.warn('⚠ Desktop app not available. Install and run PassKeyPer desktop app for full functionality.')
    }
})

// Extension lifecycle
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('PassKeyPer installed!')
        // Open welcome page
        browser.tabs.create({
            url: browser.runtime.getURL('src/welcome/index.html')
        })
    } else if (details.reason === 'update') {
        console.log('PassKeyPer updated to', browser.runtime.getManifest().version)
    }
})

// Context menu for password filling
browser.contextMenus.create({
    id: 'passkeyper-fill',
    title: 'Fill with PassKeyPer',
    contexts: ['editable']
})

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'passkeyper-fill' && tab?.id) {
        // Send message to content script to show autofill menu
        browser.tabs.sendMessage(tab.id, {
            type: 'SHOW_AUTOFILL',
            frameId: info.frameId
        })
    }
})

// Message handling from content scripts and popup
browser.runtime.onMessage.addListener((message, sender) => {
    console.log('Background received message:', message.type)

    switch (message.type) {
        case 'GET_CREDENTIALS':
            return handleGetCredentials(message.payload)

        case 'SAVE_CREDENTIALS':
            return handleSaveCredentials(message.payload)

        case 'CHECK_LOGIN_FORM':
            return handleCheckLoginForm(message.payload)

        default:
            console.warn('Unknown message type:', message.type)
            return Promise.resolve({ success: false, error: 'Unknown message type' })
    }
})

// Handlers
async function handleGetCredentials(payload: { url: string }) {
    // Get credentials from desktop app via native messaging
    const credentials = await getCredentials(payload.url)
    return {
        success: true,
        credentials
    }
}

async function handleSaveCredentials(payload: { url: string; username: string; password: string }) {
    // Save credentials to desktop app
    const success = await saveCredentials(payload.url, payload.username, payload.password)
    return {
        success
    }
}

async function handleCheckLoginForm(payload: { url: string }) {
    // Check if we have credentials for this URL
    const result = await handleGetCredentials(payload)
    return {
        success: true,
        hasCredentials: result.credentials && result.credentials.length > 0
    }
}

// Keyboard shortcut
browser.commands.onCommand.addListener((command) => {
    if (command === 'fill-password') {
        // Get active tab and trigger autofill
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0]?.id) {
                browser.tabs.sendMessage(tabs[0].id, { type: 'SHOW_AUTOFILL' })
            }
        })
    }
})

export { }
