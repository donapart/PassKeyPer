/**
 * Global State Management with Zustand
 */

import { create } from 'zustand'

interface User {
    email: string
    salt: string
}

interface Vault {
    id: string
    name: string
    type: 'personal' | 'shared' | 'work'
}

interface VaultItem {
    id: string
    vaultId: string
    type: string
    metadata: {
        name: string
        favorite: boolean
    }
}

interface AppState {
    // Authentication
    isAuthenticated: boolean
    user: User | null
    setUser: (user: User | null) => void
    logout: () => void

    // Current vault
    currentVault: Vault | null
    setCurrentVault: (vault: Vault | null) => void

    // Vaults
    vaults: Vault[]
    setVaults: (vaults: Vault[]) => void

    // Items
    items: VaultItem[]
    setItems: (items: VaultItem[]) => void

    // UI state
    isLocked: boolean
    setIsLocked: (locked: boolean) => void
    sidebarCollapsed: boolean
    toggleSidebar: () => void

    // Search
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
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

    // Search
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
}))
