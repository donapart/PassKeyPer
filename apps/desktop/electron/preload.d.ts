/**
 * Electron Preload Script
 * Exposes safe IPC methods to the renderer process
 */
export interface ElectronAPI {
    generatePassword: (options: any) => Promise<string>;
    calculateStrength: (password: string) => Promise<any>;
    createAccount: (email: string, password: string) => Promise<any>;
    login: (email: string, password: string, salt: string) => Promise<any>;
    lockVault: () => Promise<any>;
    listVaults: () => Promise<any[]>;
    createVault: (vaultData: any) => Promise<any>;
    createCloudVault: (vaultData: any, token: string) => Promise<any>;
    listItems: (vaultId: string) => Promise<any[]>;
    getItem: (itemId: string) => Promise<any>;
    createItem: (vaultId: string, itemData: any) => Promise<any>;
    updateItem: (itemId: string, updates: any) => Promise<any>;
    deleteItem: (itemId: string) => Promise<any>;
    searchItems: (vaultId: string, query: string) => Promise<any[]>;
    toggleFavorite: (itemId: string) => Promise<any>;
    inviteToVault: (vaultId: string, email: string, permission: string, token: string) => Promise<any>;
    listInvites: (type: 'sent' | 'received', token: string) => Promise<any[]>;
    acceptInvite: (token: string, authToken: string) => Promise<any>;
    getAuditLogs: (vaultId: string | undefined, token: string) => Promise<any[]>;
    setup2FA: (token: string) => Promise<any>;
    enable2FA: (data: any, token: string) => Promise<any>;
    verify2FA: (data: any) => Promise<any>;
    disable2FA: (data: any, token: string) => Promise<any>;
    listTeams: (token: string) => Promise<any[]>;
    createTeam: (teamData: any, token: string) => Promise<any>;
    getTeam: (teamId: string, token: string) => Promise<any>;
    addTeamMember: (teamId: string, email: string, role: string, token: string) => Promise<any>;
    removeTeamMember: (teamId: string, userId: string, token: string) => Promise<any>;
    updateTeam: (teamId: string, teamData: any, token: string) => Promise<any>;
    updateTeamPolicy: (teamId: string, policyData: any, token: string) => Promise<any>;
    deleteTeam: (teamId: string, token: string) => Promise<any>;
    minimizeWindow: () => Promise<void>;
    maximizeWindow: () => Promise<void>;
    quitApp: () => Promise<void>;
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=preload.d.ts.map