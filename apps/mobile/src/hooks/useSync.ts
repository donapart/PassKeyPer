import { useCallback, useEffect } from 'react'
import { useMobileStore } from '../store/mobile-store'
import { decrypt, initCrypto } from '@passkeyper/core'

export function useSync() {
    const {
        authToken,
        syncSettings,
        setVaults,
        setTeams,
        setItems,
        updateLastSync,
        isAuthenticated,
        encryptionKey,
        fetchTeams: storeFetchTeams
    } = useMobileStore()

    const fetchTeams = useCallback(async () => {
        if (!authToken) return
        await storeFetchTeams()
    }, [authToken, storeFetchTeams])

    const fetchVaults = useCallback(async () => {
        if (!authToken) return

        try {
            const response = await fetch(`${syncSettings.apiUrl}/api/vaults`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setVaults(data.vaults || [])
            }
        } catch (e) {
            console.error('Failed to fetch vaults', e)
        }
    }, [authToken, syncSettings.apiUrl, setVaults])

    const fetchItems = useCallback(async (vaultId: string) => {
        if (!authToken || !encryptionKey) return

        try {
            const response = await fetch(`${syncSettings.apiUrl}/api/items?vaultId=${vaultId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                const rawItems = data.items || []

                await initCrypto()

                const decryptedItems = await Promise.all(rawItems.map(async (item: any) => {
                    try {
                        let metadata = item.metadata || {}

                        // If we have encryptedData, decrypt it and merge with metadata
                        if (item.encryptedData) {
                            const decryptedJson = await decrypt(item.encryptedData, encryptionKey)
                            const decryptedData = JSON.parse(decryptedJson)
                            metadata = { ...metadata, ...decryptedData }
                        }

                        return {
                            ...item,
                            ...metadata,
                            id: item.id
                        }
                    } catch (err) {
                        console.error(`Failed to decrypt item ${item.id}`, err)
                        return {
                            ...item,
                            ...item.metadata,
                            id: item.id,
                            _decryptionError: true
                        }
                    }
                }))

                setItems(decryptedItems)
            }
        } catch (e) {
            console.error('Failed to fetch items', e)
        }
    }, [authToken, syncSettings.apiUrl, setItems, encryptionKey])

    const syncAll = useCallback(async () => {
        await Promise.all([
            fetchVaults(),
            fetchTeams()
        ])
        updateLastSync()
    }, [fetchVaults, fetchTeams, updateLastSync])

    // Auto-sync on mount if enabled
    useEffect(() => {
        if (isAuthenticated && syncSettings.autoSync) {
            syncAll()
        }
    }, [isAuthenticated, syncSettings.autoSync, syncAll])

    return {
        fetchVaults,
        fetchTeams,
        fetchItems,
        syncAll
    }
}

