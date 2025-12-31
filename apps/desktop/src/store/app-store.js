/**
 * Global State Management with Zustand
 */
import { create } from 'zustand';
export const useAppStore = create((set) => ({
    // Authentication
    isAuthenticated: false,
    user: null,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false, isLocked: true }),
    // Current vault
    currentVault: null,
    setCurrentVault: (vault) => set({ currentVault: vault }),
    // Vaults
    vaults: [],
    setVaults: (vaults) => set({ vaults }),
    // Items
    items: [],
    setItems: (items) => set({ items }),
    // UI state
    isLocked: true,
    setIsLocked: (locked) => set({ isLocked: locked }),
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    // Modals
    // Modals
    showImportModal: false,
    showExportModal: false,
    showConflictModal: false,
    setShowImportModal: (show) => set({ showImportModal: show }),
    setShowExportModal: (show) => set({ showExportModal: show }),
    // Sync Conflicts
    conflicts: [],
    setConflicts: (conflicts) => set({ conflicts, showConflictModal: conflicts.length > 0 }),
    // Sync Settings
    syncSettings: {
        apiUrl: localStorage.getItem('syncApiUrl') || 'http://localhost:3000',
        autoSync: localStorage.getItem('autoSync') !== 'false',
        syncInterval: parseInt(localStorage.getItem('syncInterval') || '60000')
    },
    setSyncSettings: (newSettings) => set((state) => {
        const settings = { ...state.syncSettings, ...newSettings };
        // Persist to localStorage
        if (newSettings.apiUrl !== undefined)
            localStorage.setItem('syncApiUrl', settings.apiUrl);
        if (newSettings.autoSync !== undefined)
            localStorage.setItem('autoSync', settings.autoSync.toString());
        if (newSettings.syncInterval !== undefined)
            localStorage.setItem('syncInterval', settings.syncInterval.toString());
        return { syncSettings: settings };
    }),
    // Search
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    // Sharing
    shares: [],
    invites: [],
    setShares: (shares) => set({ shares }),
    setInvites: (invites) => set({ invites }),
    // Navigation
    currentView: 'vaults',
    setCurrentView: (view) => set({ currentView: view }),
}));
//# sourceMappingURL=app-store.js.map