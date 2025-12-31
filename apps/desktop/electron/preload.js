/**
 * Electron Preload Script
 * Exposes safe IPC methods to the renderer process
 */
import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    // Password generation
    generatePassword: (options) => ipcRenderer.invoke('generate-password', options),
    calculateStrength: (password) => ipcRenderer.invoke('calculate-strength', password),
    // Authentication
    createAccount: (email, password) => ipcRenderer.invoke('create-account', email, password),
    login: (email, password, salt) => ipcRenderer.invoke('login', email, password, salt),
    verify2FA: (data) => ipcRenderer.invoke('verify-2fa', data),
    lockVault: () => ipcRenderer.invoke('lock-vault'),
    // Vault operations
    listVaults: () => ipcRenderer.invoke('list-vaults'),
    createVault: (vaultData) => ipcRenderer.invoke('create-vault', vaultData),
    createCloudVault: (vaultData, token) => ipcRenderer.invoke('create-cloud-vault', vaultData, token),
    // Item operations
    listItems: (vaultId) => ipcRenderer.invoke('list-items', vaultId),
    getItem: (itemId) => ipcRenderer.invoke('get-item', itemId),
    createItem: (vaultId, itemData) => ipcRenderer.invoke('create-item', vaultId, itemData),
    updateItem: (itemId, updates) => ipcRenderer.invoke('update-item', itemId, updates),
    deleteItem: (itemId) => ipcRenderer.invoke('delete-item', itemId),
    searchItems: (vaultId, query) => ipcRenderer.invoke('search-items', vaultId, query),
    toggleFavorite: (itemId) => ipcRenderer.invoke('toggle-favorite', itemId),
    // Sharing operations
    inviteToVault: (vaultId, email, permission, token) => ipcRenderer.invoke('invite-to-vault', vaultId, email, permission, token),
    listInvites: (type, token) => ipcRenderer.invoke('list-invites', type, token),
    acceptInvite: (token, authToken) => ipcRenderer.invoke('accept-invite', token, authToken),
    getAuditLogs: (vaultId, token) => ipcRenderer.invoke('get-audit-logs', vaultId, token),
    // 2FA Management
    setup2FA: (token) => ipcRenderer.invoke('setup-2fa', token),
    enable2FA: (data, token) => ipcRenderer.invoke('enable-2fa', data, token),
    disable2FA: (data, token) => ipcRenderer.invoke('disable-2fa', data, token),
    // Team operations
    listTeams: (token) => ipcRenderer.invoke('list-teams', token),
    createTeam: (teamData, token) => ipcRenderer.invoke('create-team', teamData, token),
    getTeam: (teamId, token) => ipcRenderer.invoke('get-team', teamId, token),
    addTeamMember: (teamId, email, role, token) => ipcRenderer.invoke('add-team-member', teamId, email, role, token),
    removeTeamMember: (teamId, userId, token) => ipcRenderer.invoke('remove-team-member', teamId, userId, token),
    updateTeam: (teamId, teamData, token) => ipcRenderer.invoke('update-team', teamId, teamData, token),
    updateTeamPolicy: (teamId, policyData, token) => ipcRenderer.invoke('update-team-policy', teamId, policyData, token),
    deleteTeam: (teamId, token) => ipcRenderer.invoke('delete-team', teamId, token),
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
});
//# sourceMappingURL=preload.js.map