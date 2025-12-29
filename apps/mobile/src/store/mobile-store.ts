import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
    id: string
    email: string
    publicKey: string
    encryptedPrivateKey: string
}

interface Vault {
    id: string
    name: string
    type: 'personal' | 'shared'
}

interface Item {
    id: string
    vaultId: string
    type: string
    metadata: any
    version: number
}

interface SyncSettings {
    apiUrl: string
    autoSync: boolean
    syncInterval: number
    lastSync: number | null
}

interface MobileState {
    // Auth
    user: User | null
    isAuthenticated: boolean
    authToken: string | null

    // Data
    vaults: Vault[]
    items: Item[]
    currentVault: Vault | null
    searchQuery: string

    // Sync
    syncSettings: SyncSettings

    // Actions
    login: (user: User, token: string) => void
    logout: () => void
    setVaults: (vaults: Vault[]) => void
    setItems: (items: Item[]) => void
    setSyncSettings: (settings: Partial<SyncSettings>) => void
    updateLastSync: () => void
    setCurrentVault: (vault: Vault | null) => void
    createVault: (name: string, type: 'personal' | 'shared') => Promise<void>
    setSearchQuery: (query: string) => void

    // Item CRUD
    createItem: (itemData: any) => Promise<void>
    updateItem: (id: string, itemData: any) => Promise<void>
    deleteItem: (id: string) => Promise<void>
}

export const useMobileStore = create<MobileState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            authToken: null,
            vaults: [],
            items: [],
            currentVault: null,
            searchQuery: '',
            syncSettings: {
                apiUrl: 'http://localhost:3000',
                autoSync: true,
                syncInterval: 5,
                lastSync: null
            },

            login: (user, token) => set({ user, authToken: token, isAuthenticated: true }),

            logout: () => set({ user: null, authToken: null, isAuthenticated: false, vaults: [], items: [], currentVault: null, searchQuery: '' }),

            setVaults: (vaults) => set({ vaults }),

            setItems: (items) => set({ items }),

            setCurrentVault: (vault) => set({ currentVault: vault }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            createVault: async (name, type) => {
                const { syncSettings, authToken, vaults } = get()
                try {
                    const response = await fetch(`${syncSettings.apiUrl}/api/vaults`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            name,
                            type,
                            encryptedKey: 'mock-key' // In real app, generate key
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const newVault = data.vault || data
                        set({ vaults: [...vaults, newVault] })
                    }
                } catch (e) {
                    console.error('Failed to create vault', e)
                }
            },

            createItem: async (itemData) => {
                const { syncSettings, authToken, items, currentVault } = get()
                if (!currentVault) return

                try {
                    // Start with basic payload structure
                    const payload = {
                        vaultId: currentVault.id,
                        type: itemData.type || 'password',
                        encryptedData: 'mock-encrypted-data', // Real app needs encryption
                        metadata: {
                            name: itemData.name,
                            username: itemData.username,
                            url: itemData.url
                        }
                    }

                    const response = await fetch(`${syncSettings.apiUrl}/api/items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify(payload)
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const newItem = data // Item response
                        // Merge metadata into item object for easier consumption in UI if API doesn't flatten
                        // But UI expects item.name etc. API returns item with metadata JSON.
                        // We'll flatten it here for the store state?
                        // Or ensure UI handles it. The UI code expects `item.name`.
                        const flatItem = {
                            ...newItem,
                            ...newItem.metadata,
                            id: newItem.id
                        }
                        set({ items: [...items, flatItem] })
                    }
                } catch (e) {
                    console.error('Failed to create item', e)
                }
            },

            updateItem: async (id, itemData) => {
                const { syncSettings, authToken, items } = get()
                try {
                    const response = await fetch(`${syncSettings.apiUrl}/api/items/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            // Real app needs to re-encrypt data
                            encryptedData: 'mock-updated-encrypted-data',
                            version: (items.find(i => i.id === id)?.version || 0)
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const updatedItem = {
                            ...items.find(i => i.id === id),
                            ...data,
                            ...itemData // Optimistic update or waiting for metadata support in API response
                        }
                        set({ items: items.map(i => i.id === id ? updatedItem : i) })
                    }
                } catch (e) {
                    console.error('Failed to update item', e)
                }
            },

            deleteItem: async (id) => {
                const { syncSettings, authToken, items } = get()
                try {
                    const response = await fetch(`${syncSettings.apiUrl}/api/items/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    })

                    if (response.ok) {
                        set({ items: items.filter(i => i.id !== id) })
                    }
                } catch (e) {
                    console.error('Failed to delete item', e)
                }
            },

            setSyncSettings: (settings) => set((state) => ({
                syncSettings: { ...state.syncSettings, ...settings }
            })),

            updateLastSync: () => set((state) => ({
                syncSettings: { ...state.syncSettings, lastSync: Date.now() }
            }))
        }),
        {
            name: 'passkeyper-mobile-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                authToken: state.authToken,
                syncSettings: state.syncSettings,
                vaults: state.vaults,
                items: state.items
            })
        }
    )
)
