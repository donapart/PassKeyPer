import { useCallback, useEffect } from 'react'
import { useMobileStore } from '../store/mobile-store'

export function useSync() {
    const {
        authToken,
        syncSettings,
        setVaults,
        setItems,
        updateLastSync,
        isAuthenticated
    } = useMobileStore()

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
        if (!authToken) return

        try {
            const response = await fetch(`${syncSettings.apiUrl}/api/items?vaultId=${vaultId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                // Flatten metadata into items for UI consumption
                const items = (data.items || []).map((item: any) => ({
                    ...item,
                    ...item.metadata,
                    id: item.id
                }))
                setItems(items)
            }
        } catch (e) {
            console.error('Failed to fetch items', e)
        }
    }, [authToken, syncSettings.apiUrl, setItems])

    const syncAll = useCallback(async () => {
        await fetchVaults()
        updateLastSync()
    }, [fetchVaults, updateLastSync])

    // Auto-sync on mount if enabled
    useEffect(() => {
        if (isAuthenticated && syncSettings.autoSync) {
            syncAll()
        }
    }, [isAuthenticated, syncSettings.autoSync, syncAll])

    return {
        fetchVaults,
        fetchItems,
        syncAll
    }
}
