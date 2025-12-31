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
    verify2FA: (data: any) => ipcRenderer.invoke('verify-2fa', data),
    lockVault: () => ipcRenderer.invoke('lock-vault'),

    // Vault operations
    listVaults: () => ipcRenderer.invoke('list-vaults'),
    createVault: (vaultData: any) => ipcRenderer.invoke('create-vault', vaultData),
    createCloudVault: (vaultData: any, token: string) => ipcRenderer.invoke('create-cloud-vault', vaultData, token),

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

    // Sharing operations
    inviteToVault: (vaultId: string, email: string, permission: string, token: string) =>
        ipcRenderer.invoke('invite-to-vault', vaultId, email, permission, token),
    listInvites: (type: 'sent' | 'received', token: string) => ipcRenderer.invoke('list-invites', type, token),
    acceptInvite: (token: string, authToken: string) => ipcRenderer.invoke('accept-invite', token, authToken),
    getAuditLogs: (vaultId: string | undefined, token: string) => ipcRenderer.invoke('get-audit-logs', vaultId, token),

    // 2FA Management
    setup2FA: (token: string) => ipcRenderer.invoke('setup-2fa', token),
    enable2FA: (data: any, token: string) => ipcRenderer.invoke('enable-2fa', data, token),
    disable2FA: (data: any, token: string) => ipcRenderer.invoke('disable-2fa', data, token),

    // Team operations
    listTeams: (token: string) => ipcRenderer.invoke('list-teams', token),
    createTeam: (teamData: any, token: string) => ipcRenderer.invoke('create-team', teamData, token),
    getTeam: (teamId: string, token: string) => ipcRenderer.invoke('get-team', teamId, token),
    addTeamMember: (teamId: string, email: string, role: string, token: string) =>
        ipcRenderer.invoke('add-team-member', teamId, email, role, token),
    removeTeamMember: (teamId: string, userId: string, token: string) =>
        ipcRenderer.invoke('remove-team-member', teamId, userId, token),
    updateTeam: (teamId: string, teamData: any, token: string) =>
        ipcRenderer.invoke('update-team', teamId, teamData, token),
    updateTeamPolicy: (teamId: string, policyData: any, token: string) =>
        ipcRenderer.invoke('update-team-policy', teamId, policyData, token),
    deleteTeam: (teamId: string, token: string) =>
        ipcRenderer.invoke('delete-team', teamId, token),

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
    createCloudVault: (vaultData: any, token: string) => Promise<any>
    listItems: (vaultId: string) => Promise<any[]>
    getItem: (itemId: string) => Promise<any>
    createItem: (vaultId: string, itemData: any) => Promise<any>
    updateItem: (itemId: string, updates: any) => Promise<any>
    deleteItem: (itemId: string) => Promise<any>
    searchItems: (vaultId: string, query: string) => Promise<any[]>
    toggleFavorite: (itemId: string) => Promise<any>
    inviteToVault: (vaultId: string, email: string, permission: string, token: string) => Promise<any>
    listInvites: (type: 'sent' | 'received', token: string) => Promise<any[]>
    acceptInvite: (token: string, authToken: string) => Promise<any>
    getAuditLogs: (vaultId: string | undefined, token: string) => Promise<any[]>
    setup2FA: (token: string) => Promise<any>
    enable2FA: (data: any, token: string) => Promise<any>
    verify2FA: (data: any) => Promise<any>
    disable2FA: (data: any, token: string) => Promise<any>
    listTeams: (token: string) => Promise<any[]>
    createTeam: (teamData: any, token: string) => Promise<any>
    getTeam: (teamId: string, token: string) => Promise<any>
    addTeamMember: (teamId: string, email: string, role: string, token: string) => Promise<any>
    removeTeamMember: (teamId: string, userId: string, token: string) => Promise<any>
    updateTeam: (teamId: string, teamData: any, token: string) => Promise<any>
    updateTeamPolicy: (teamId: string, policyData: any, token: string) => Promise<any>
    deleteTeam: (teamId: string, token: string) => Promise<any>
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<void>
    quitApp: () => Promise<void>
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}
