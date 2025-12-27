/**
 * Electron Preload Script
 * Exposes safe IPC methods to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // Password generation
    generatePassword: (options: any) => ipcRenderer.invoke('generate-password', options),
    calculateStrength: (password: string) => ipcRenderer.invoke('calculate-strength', password),

    // Authentication
    createAccount: (email: string, password: string) =>
        ipcRenderer.invoke('create-account', email, password),
    login: (email: string, password: string, salt: string) =>
        ipcRenderer.invoke('login', email, password, salt),
    lockVault: () => ipcRenderer.invoke('lock-vault'),

    // Vault operations
    listVaults: () => ipcRenderer.invoke('list-vaults'),
    createVault: (vaultData: any) => ipcRenderer.invoke('create-vault', vaultData),

    // Item operations
    listItems: (vaultId: string) => ipcRenderer.invoke('list-items', vaultId),
    getItem: (itemId: string) => ipcRenderer.invoke('get-item', itemId),
    createItem: (vaultId: string, itemData: any) =>
        ipcRenderer.invoke('create-item', vaultId, itemData),
    updateItem: (itemId: string, updates: any) =>
        ipcRenderer.invoke('update-item', itemId, updates),
    deleteItem: (itemId: string) => ipcRenderer.invoke('delete-item', itemId),
    searchItems: (vaultId: string, query: string) =>
        ipcRenderer.invoke('search-items', vaultId, query),
    toggleFavorite: (itemId: string) => ipcRenderer.invoke('toggle-favorite', itemId),

    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
})

// Type definitions for TypeScript
export interface ElectronAPI {
    generatePassword: (options: any) => Promise<string>
    calculateStrength: (password: string) => Promise<any>
    createAccount: (email: string, password: string) => Promise<any>
    login: (email: string, password: string, salt: string) => Promise<any>
    lockVault: () => Promise<any>
    listVaults: () => Promise<any[]>
    createVault: (vaultData: any) => Promise<any>
    listItems: (vaultId: string) => Promise<any[]>
    getItem: (itemId: string) => Promise<any>
    createItem: (vaultId: string, itemData: any) => Promise<any>
    updateItem: (itemId: string, updates: any) => Promise<any>
    deleteItem: (itemId: string) => Promise<any>
    searchItems: (vaultId: string, query: string) => Promise<any[]>
    toggleFavorite: (itemId: string) => Promise<any>
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<void>
    quitApp: () => Promise<void>
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}
