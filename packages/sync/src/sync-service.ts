/**
 * Sync Service Package
 * Handles cloud synchronization for desktop app
 */

import { EventEmitter } from 'events'

interface SyncConfig {
    apiUrl: string
    wsUrl: string
    token: string
    deviceId: string
}

interface SyncStatus {
    isSyncing: boolean
    lastSync: Date | null
    errors: string[]
    itemsUpdated: number
    itemsConflicted: number
}

export class SyncService extends EventEmitter {
    private config: SyncConfig
    private ws: WebSocket | null = null
    private status: SyncStatus = {
        isSyncing: false,
        lastSync: null,
        errors: [],
        itemsUpdated: 0,
        itemsConflicted: 0,
    }
    private reconnectTimer: NodeJS.Timeout | null = null

    constructor(config: SyncConfig) {
        super()
        this.config = config
    }

    /**
     * Initialize sync service
     */
    async initialize(): Promise<void> {
        await this.connectWebSocket()
        this.emit('initialized')
    }

    /**
     * Connect to WebSocket server
     */
    private async connectWebSocket(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.wsUrl)

                this.ws.onopen = () => {
                    console.log('WebSocket connected')
                    this.authenticate()
                    resolve()
                }

                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data))
                }

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    reject(error)
                }

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected')
                    this.emit('disconnected')
                    this.scheduleReconnect()
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Authenticate WebSocket connection
     */
    private authenticate(): void {
        if (!this.ws) return

        this.ws.send(
            JSON.stringify({
                type: 'AUTH',
                token: this.config.token,
                deviceId: this.config.deviceId,
            })
        )
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(message: any): void {
        switch (message.type) {
            case 'AUTH_SUCCESS':
                console.log('WebSocket authenticated')
                this.emit('authenticated')
                break

            case 'SYNC_RESPONSE':
                this.handleSyncResponse(message)
                break

            case 'ITEM_UPDATED':
                this.handleItemUpdate(message)
                break

            case 'PONG':
                // Heartbeat response
                break

            default:
                console.log('Unknown message type:', message.type)
        }
    }

    /**
     * Pull updates from server
     */
    async pullUpdates(vaultId: string, lastSyncTimestamp: number): Promise<any> {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/sync/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.config.token}`,
                    'X-Device-ID': this.config.deviceId,
                },
                body: JSON.stringify({
                    vaultId,
                    lastSyncTimestamp,
                    deviceId: this.config.deviceId,
                }),
            })

            if (!response.ok) {
                throw new Error(`Pull failed: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Pull updates error:', error)
            throw error
        }
    }

    /**
     * Push local changes to server
     */
    async pushChanges(vaultId: string, items: any[]): Promise<any> {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/sync/push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.config.token}`,
                    'X-Device-ID': this.config.deviceId,
                },
                body: JSON.stringify({
                    vaultId,
                    items,
                    deviceId: this.config.deviceId,
                }),
            })

            if (!response.ok) {
                throw new Error(`Push failed: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Push changes error:', error)
            throw error
        }
    }

    /**
     * Perform full sync
     */
    async sync(vaultId: string): Promise<void> {
        if (this.status.isSyncing) {
            console.log('Sync already in progress')
            return
        }

        this.status.isSyncing = true
        this.status.errors = []
        this.status.itemsUpdated = 0
        this.status.itemsConflicted = 0
        this.emit('sync-start')

        try {
            // Get last sync timestamp from local storage
            const lastSync = this.status.lastSync?.getTime() || 0

            // Pull updates from server
            const pullResult = await this.pullUpdates(vaultId, lastSync)

            // Apply updates locally
            for (const item of pullResult.updates) {
                try {
                    await this.applyUpdate(item)
                    this.status.itemsUpdated++
                } catch (error) {
                    console.error('Failed to apply update:', error)
                    this.status.errors.push(`Failed to update item ${item.id}`)
                }
            }

            // Handle deletions
            for (const deleted of pullResult.deleted) {
                try {
                    await this.applyDeletion(deleted.id)
                } catch (error) {
                    console.error('Failed to apply deletion:', error)
                }
            }

            // Get local changes
            const localChanges = await this.getLocalChanges(vaultId, lastSync)

            // Push local changes to server
            if (localChanges.length > 0) {
                const pushResult = await this.pushChanges(vaultId, localChanges)

                // Handle conflicts
                for (const result of pushResult.results) {
                    if (result.status === 'conflict') {
                        this.status.itemsConflicted++
                        this.emit('conflict', result)
                    }
                }
            }

            // Update sync status
            this.status.lastSync = new Date(pullResult.timestamp)
            this.emit('sync-complete', this.status)
        } catch (error: any) {
            console.error('Sync error:', error)
            this.status.errors.push(error.message)
            this.emit('sync-error', error)
        } finally {
            this.status.isSyncing = false
        }
    }

    /**
     * Apply server update to local database
     */
    private async applyUpdate(item: any): Promise<void> {
        // This would interact with local storage
        // For now, just emit event
        this.emit('item-updated', item)
    }

    /**
     * Apply server deletion to local database
     */
    private async applyDeletion(itemId: string): Promise<void> {
        // This would interact with local storage
        this.emit('item-deleted', itemId)
    }

    /**
     * Get local changes since last sync
     */
    private async getLocalChanges(vaultId: string, since: number): Promise<any[]> {
        // This would query local database
        // For now, return empty array
        return []
    }

    /**
     * Handle sync response from WebSocket
     */
    private handleSyncResponse(message: any): void {
        this.emit('sync-response', message)
    }

    /**
     * Handle item update from WebSocket
     */
    private handleItemUpdate(message: any): void {
        this.emit('remote-update', message.item)
    }

    /**
     * Schedule WebSocket reconnection
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) return

        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...')
            this.reconnectTimer = null
            this.connectWebSocket().catch((error) => {
                console.error('Reconnection failed:', error)
            })
        }, 5000) // Retry after 5 seconds
    }

    /**
     * Get current sync status
     */
    getStatus(): SyncStatus {
        return { ...this.status }
    }

    /**
     * Disconnect and cleanup
     */
    async disconnect(): Promise<void> {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }
}

/**
 * Create sync service instance
 */
export function createSyncService(config: SyncConfig): SyncService {
    return new SyncService(config)
}
