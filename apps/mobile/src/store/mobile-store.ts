import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
    deriveMasterKey,
    deriveKeys,
    deriveServerHash,
    encrypt,
    decrypt,
    generateEncryptionKey,
    initCrypto
} from '@passkeyper/core'

interface User {
    id: string
    email: string
    publicKey: string
    encryptedPrivateKey: string
}

interface Vault {
    id: string
    name: string
    type: 'personal' | 'shared' | 'work'
    teamId?: string
    team?: { id: string, name: string }
}

interface Team {
    id: string
    name: string
    description: string
    _count: { members: number, vaults: number }
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
    // Auth - Persisted
    user: User | null
    isAuthenticated: boolean
    authToken: string | null

    // Auth - Volatile
    masterKey: Uint8Array | null
    encryptionKey: Uint8Array | null
    authKey: Uint8Array | null

    // Data
    vaults: Vault[]
    teams: Team[]
    items: Item[]
    currentVault: Vault | null
    searchQuery: string

    // Sync
    syncSettings: SyncSettings

    // Actions
    login: (user: User, token: string, masterKey: Uint8Array) => void
    logout: () => void
    setVaults: (vaults: Vault[]) => void
    setTeams: (teams: Team[]) => void
    setItems: (items: Item[]) => void
    setSyncSettings: (settings: Partial<SyncSettings>) => void
    updateLastSync: () => void
    setCurrentVault: (vault: Vault | null) => void
    fetchTeams: () => Promise<void>
    createVault: (name: string, type: 'personal' | 'shared' | 'work', teamId?: string) => Promise<void>
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
            masterKey: null,
            encryptionKey: null,
            authKey: null,
            vaults: [],
            teams: [],
            items: [],
            currentVault: null,
            searchQuery: '',
            syncSettings: {
                apiUrl: 'http://localhost:3000',
                autoSync: true,
                syncInterval: 5,
                lastSync: null
            },

            login: (user, token, masterKey) => {
                const { encryptionKey, authKey } = deriveKeys(masterKey, user.email)
                set({
                    user,
                    authToken: token,
                    isAuthenticated: true,
                    masterKey,
                    encryptionKey,
                    authKey
                })
            },

            logout: () => set({
                user: null,
                authToken: null,
                isAuthenticated: false,
                masterKey: null,
                encryptionKey: null,
                authKey: null,
                vaults: [],
                items: [],
                currentVault: null,
                searchQuery: ''
            }),

            setVaults: (vaults) => set({ vaults }),

            setTeams: (teams) => set({ teams }),

            setItems: (items) => set({ items }),

            setCurrentVault: (vault) => set({ currentVault: vault }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            fetchTeams: async () => {
                const { syncSettings, authToken } = get()
                try {
                    const response = await fetch(`${syncSettings.apiUrl}/api/teams`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    })
                    if (response.ok) {
                        const data = await response.json()
                        set({ teams: data.teams || [] })
                    }
                } catch (e) {
                    console.error('Failed to fetch teams', e)
                }
            },

            createVault: async (name, type, teamId) => {
                const { syncSettings, authToken, vaults, encryptionKey } = get()
                if (!encryptionKey) return

                try {
                    // In a real app, we'd generate a vault key and encrypt it with user's encryptionKey
                    // For now, we'll use a simplified version for the sync API
                    const response = await fetch(`${syncSettings.apiUrl}/api/vaults`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            name,
                            type,
                            teamId,
                            encryptedKey: 'placeholder-vault-key'
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
                const { syncSettings, authToken, items, currentVault, encryptionKey } = get()
                if (!currentVault || !encryptionKey) return

                try {
                    // Encrypt metadata
                    const plaintext = JSON.stringify({
                        name: itemData.name,
                        username: itemData.username,
                        url: itemData.url,
                        password: itemData.password,
                        notes: itemData.notes,
                        fields: itemData.fields || []
                    })

                    await initCrypto()
                    const encryptedData = await encrypt(plaintext, encryptionKey)

                    const payload = {
                        vaultId: currentVault.id,
                        type: itemData.type || 'password',
                        encryptedData,
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
                        const newItem = {
                            ...data,
                            ...itemData, // Use local data for UI responsiveness
                            id: data.id
                        }
                        set({ items: [...items, newItem] })
                    }
                } catch (e) {
                    console.error('Failed to create item', e)
                }
            },

            updateItem: async (id, itemData) => {
                const { syncSettings, authToken, items, encryptionKey } = get()
                if (!encryptionKey) return

                try {
                    const item = items.find(i => i.id === id)
                    if (!item) return

                    const plaintext = JSON.stringify({
                        ...itemData,
                        id
                    })

                    await initCrypto()
                    const encryptedData = await encrypt(plaintext, encryptionKey)

                    const response = await fetch(`${syncSettings.apiUrl}/api/items/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            encryptedData,
                            version: (item.version || 0) + 1,
                            metadata: {
                                name: itemData.name,
                                username: itemData.username,
                                url: itemData.url
                            }
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const updatedItem = {
                            ...item,
                            ...data,
                            ...itemData
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
                teams: state.teams,
                items: state.items
            })
        }
    )
)

