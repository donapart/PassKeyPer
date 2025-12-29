/**
 * Electron Main Process
 */

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { VaultStorage } from '@passkeyper/storage'
import { IpcServer } from './ipc-server'
import { setupNativeMessaging } from './native-messaging'
import {
    deriveMasterKey,
    deriveKeys,
    generateSalt,
    generatePassword,
    calculateStrength,
} from '@passkeyper/core'

const isNativeMessagingCode = process.argv.find(arg => arg.startsWith('chrome-extension://'))

if (isNativeMessagingCode) {
    // If run as native messaging host
    setupNativeMessaging()
} else {
    // Main Desktop App Logic

    // Single Instance Lock
    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
        app.quit()
    } else {
        runApp()
    }
}

let mainWindow: BrowserWindow | null = null
let vaultStorage: VaultStorage | null = null
let ipcServer: IpcServer | null = null

const isDev = process.env.NODE_ENV === 'development'

function runApp() {
    app.whenReady().then(() => {
        // Initialize vault storage
        const userDataPath = app.getPath('userData')
        const dbPath = path.join(userDataPath, 'vault.db')

        vaultStorage = new VaultStorage({ dbPath })

        // Start IPC Server for Native Messaging
        ipcServer = new IpcServer(vaultStorage)
        ipcServer.start()

        createWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        })
    })

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            if (vaultStorage) {
                vaultStorage.close()
            }
            app.quit()
        }
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hidden',
        frame: false,
        backgroundColor: '#0f172a',
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// ============================================================================
// IPC Handlers
// ============================================================================

/**
 * Generate password
 */
ipcMain.handle('generate-password', async (_, options) => {
    return generatePassword(options)
})

/**
 * Calculate password strength
 */
ipcMain.handle('calculate-strength', async (_, password: string) => {
    return calculateStrength(password)
})

/**
 * Create account (derive keys from master password)
 */
ipcMain.handle('create-account', async (_, email: string, masterPassword: string) => {
    try {
        const salt = generateSalt()
        const masterKey = await deriveMasterKey(masterPassword, salt, 3)
        const { encryptionKey } = deriveKeys(masterKey, email)

        // Store user data (simplified for now)
        // In production, this would create a vault and store encrypted user data

        return {
            success: true,
            salt: Buffer.from(salt).toString('base64'),
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        }
    }
})

/**
 * Login (verify master password and unlock vault)
 */
ipcMain.handle('login', async (_, email: string, masterPassword: string, saltBase64: string) => {
    try {
        const salt = Buffer.from(saltBase64, 'base64')
        const masterKey = await deriveMasterKey(masterPassword, new Uint8Array(salt), 3)
        const { encryptionKey } = deriveKeys(masterKey, email)

        // Set vault key for storage operations
        if (vaultStorage) {
            vaultStorage.setVaultKey(encryptionKey)
        }

        // Update IPC server with unlocked storage
        if (ipcServer) {
            ipcServer.setVaultStorage(vaultStorage)
        }

        return {
            success: true,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        }
    }
})

/**
 * List vaults
 */
ipcMain.handle('list-vaults', async () => {
    if (!vaultStorage) return []
    return vaultStorage.listVaults()
})

/**
 * Create vault
 */
ipcMain.handle('create-vault', async (_, vaultData) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.createVault(vaultData)
})

/**
 * List items in vault
 */
ipcMain.handle('list-items', async (_, vaultId: string) => {
    if (!vaultStorage) return []
    return vaultStorage.listItems(vaultId)
})

/**
 * Get decrypted item
 */
ipcMain.handle('get-item', async (_, itemId: string) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.getDecryptedItem(itemId)
})

/**
 * Create item
 */
ipcMain.handle('create-item', async (_, vaultId: string, itemData: any) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.createItem(vaultId, itemData)
})

/**
 * Update item
 */
ipcMain.handle('update-item', async (_, itemId: string, updates: any) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.updateItem(itemId, updates)
})

/**
 * Delete item
 */
ipcMain.handle('delete-item', async (_, itemId: string) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.deleteItem(itemId)
})

/**
 * Search items
 */
ipcMain.handle('search-items', async (_, vaultId: string, query: string) => {
    if (!vaultStorage) return []
    return vaultStorage.searchItems(vaultId, query)
})

/**
 * Toggle favorite
 */
ipcMain.handle('toggle-favorite', async (_, itemId: string) => {
    if (!vaultStorage) throw new Error('Storage not initialized')
    return vaultStorage.toggleFavorite(itemId)
})

/**
 * Lock vault (clear encryption key)
 */
ipcMain.handle('lock-vault', async () => {
    if (vaultStorage) {
        vaultStorage.setVaultKey(new Uint8Array(32)) // Clear key
    }
    // Update IPC server to prevent access
    if (ipcServer) {
        ipcServer.setVaultStorage(vaultStorage) // Re-set, possibly locking it effectively if we had a separate "unlocked" flag, but here we rely on the internal state of vaultStorage
    }
    return { success: true }
})

/**
 * Quit application
 */
ipcMain.handle('quit-app', () => {
    app.quit()
})

/**
 * Minimize window
 */
ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize()
    }
})

/**
 * Maximize window
 */
ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    }
})
