/**
 * Global State Management with Zustand
 */
interface User {
    email: string;
    salt: string;
    twoFactorEnabled: boolean;
}
interface Vault {
    id: string;
    name: string;
    type: 'personal' | 'shared' | 'work';
}
interface VaultItem {
    id: string;
    vaultId: string;
    type: string;
    metadata: {
        name: string;
        favorite: boolean;
    };
}
interface AppState {
    isAuthenticated: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    currentVault: Vault | null;
    setCurrentVault: (vault: Vault | null) => void;
    vaults: Vault[];
    setVaults: (vaults: Vault[]) => void;
    items: VaultItem[];
    setItems: (items: VaultItem[]) => void;
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    showImportModal: boolean;
    showExportModal: boolean;
    showConflictModal: boolean;
    setShowImportModal: (show: boolean) => void;
    setShowExportModal: (show: boolean) => void;
    conflicts: any[];
    setConflicts: (conflicts: any[]) => void;
    syncSettings: {
        apiUrl: string;
        autoSync: boolean;
        syncInterval: number;
    };
    setSyncSettings: (settings: Partial<{
        apiUrl: string;
        autoSync: boolean;
        syncInterval: number;
    }>) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    shares: any[];
    invites: any[];
    setShares: (shares: any[]) => void;
    setInvites: (invites: any[]) => void;
    currentView: 'vaults' | 'teams';
    setCurrentView: (view: 'vaults' | 'teams') => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
export {};
//# sourceMappingURL=app-store.d.ts.map