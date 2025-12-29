import ipc from 'node-ipc'
import { ipcMain } from 'electron'
import { VaultStorage } from '@passkeyper/storage'

export class IpcServer {
    private vaultStorage: VaultStorage | null = null

    constructor(vaultStorage: VaultStorage | null) {
        this.vaultStorage = vaultStorage

        ipc.config.id = 'passkeyper-desktop'
        ipc.config.retry = 1500
        ipc.config.silent = true
    }

    start() {
        ipc.serve(() => {
            ipc.server.on('GET_CREDENTIALS', async (payload: { url: string }, socket) => {
                try {
                    if (!this.vaultStorage) {
                        ipc.server.emit(socket, 'ERROR', { message: 'Vault locked or not initialized' })
                        return
                    }

                    // For now, since we don't have a direct "find by URL" method exposed on vaultStorage efficiently and securely without key check...
                    // Wait, main.ts initializes vaultStorage. If it is unlocked, we can query.

                    // Retrieve user credentials
                    // In a real scenario, we might need to filter by URL more smartly
                    const credentials = await this.searchCredentials(payload.url)

                    ipc.server.emit(socket, 'CREDENTIALS', { credentials })
                } catch (error: any) {
                    ipc.server.emit(socket, 'ERROR', { message: error.message })
                }
            })

            ipc.server.on('SAVE_CREDENTIALS', async (payload: any, socket) => {
                // Implementation for save
                ipc.server.emit(socket, 'SAVED', { success: true })
            })
        })

        ipc.server.start()
        console.log('IPC Server started')
    }

    setVaultStorage(storage: VaultStorage | null) {
        this.vaultStorage = storage
    }

    private async searchCredentials(url: string) {
        if (!this.vaultStorage) return []

        // This is a simplified search. In production, we'd use a dedicated method
        // to match domains (e.g., github.com matching subdomains too)

        // Get all items from current available vaults (assuming active one for now or all?)
        // The desktop app might have multiple vaults. 
        // For MVP, we search all unlocked vaults.

        const vaults = await this.vaultStorage.listVaults()
        let matches: any[] = []

        for (const vault of vaults) {
            try {
                const items = await this.vaultStorage.listItems(vault.id)
                // decrypt and check url
                // Note: listItems usually returns metadata. 
                // We need to fetch full items to check URLs if they are encrypted.
                // Optimally, domains should be indexable/searchable.

                // For now, we use searchItems which is implemented
                const searchResults = await this.vaultStorage.searchItems(vault.id, url)
                matches = [...matches, ...searchResults]
            } catch (e) {
                // Ignore locked vaults or errors
            }
        }

        return matches.map(m => ({
            username: m.login?.username,
            password: m.login?.password,
            url: m.login?.uris?.[0]?.uri
        }))
    }
}
