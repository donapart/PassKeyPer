/**
 * Sync Service Package
 * Handles cloud synchronization for desktop app
 */
import { EventEmitter } from 'events';
export class SyncService extends EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.status = {
            isSyncing: false,
            lastSync: null,
            errors: [],
            itemsUpdated: 0,
            itemsConflicted: 0,
        };
        this.reconnectTimer = null;
        this.config = config;
    }
    /**
     * Initialize sync service
     */
    async initialize() {
        await this.connectWebSocket();
        this.emit('initialized');
    }
    /**
     * Connect to WebSocket server
     */
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.wsUrl);
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.authenticate();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.emit('disconnected');
                    this.scheduleReconnect();
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Authenticate WebSocket connection
     */
    authenticate() {
        if (!this.ws)
            return;
        this.ws.send(JSON.stringify({
            type: 'AUTH',
            token: this.config.token,
            deviceId: this.config.deviceId,
        }));
    }
    /**
     * Handle incoming WebSocket message
     */
    handleMessage(message) {
        switch (message.type) {
            case 'AUTH_SUCCESS':
                console.log('WebSocket authenticated');
                this.emit('authenticated');
                break;
            case 'SYNC_RESPONSE':
                this.handleSyncResponse(message);
                break;
            case 'ITEM_UPDATED':
                this.handleItemUpdate(message);
                break;
            case 'PONG':
                // Heartbeat response
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }
    /**
     * Pull updates from server
     */
    async pullUpdates(vaultId, lastSyncTimestamp) {
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
            });
            if (!response.ok) {
                throw new Error(`Pull failed: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Pull updates error:', error);
            throw error;
        }
    }
    /**
     * Push local changes to server
     */
    async pushChanges(vaultId, items) {
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
            });
            if (!response.ok) {
                throw new Error(`Push failed: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Push changes error:', error);
            throw error;
        }
    }
    /**
     * Perform full sync
     */
    async sync(vaultId) {
        if (this.status.isSyncing) {
            console.log('Sync already in progress');
            return;
        }
        this.status.isSyncing = true;
        this.status.errors = [];
        this.status.itemsUpdated = 0;
        this.status.itemsConflicted = 0;
        this.emit('sync-start');
        try {
            // Get last sync timestamp from local storage
            const lastSync = this.status.lastSync?.getTime() || 0;
            // Pull updates from server
            const pullResult = await this.pullUpdates(vaultId, lastSync);
            // Apply updates locally
            for (const item of pullResult.updates) {
                try {
                    await this.applyUpdate(item);
                    this.status.itemsUpdated++;
                }
                catch (error) {
                    console.error('Failed to apply update:', error);
                    this.status.errors.push(`Failed to update item ${item.id}`);
                }
            }
            // Handle deletions
            for (const deleted of pullResult.deleted) {
                try {
                    await this.applyDeletion(deleted.id);
                }
                catch (error) {
                    console.error('Failed to apply deletion:', error);
                }
            }
            // Get local changes
            const localChanges = await this.getLocalChanges(vaultId, lastSync);
            // Push local changes to server
            if (localChanges.length > 0) {
                const pushResult = await this.pushChanges(vaultId, localChanges);
                // Handle conflicts
                for (const result of pushResult.results) {
                    if (result.status === 'conflict') {
                        this.status.itemsConflicted++;
                        this.emit('conflict', result);
                    }
                }
            }
            // Update sync status
            this.status.lastSync = new Date(pullResult.timestamp);
            this.emit('sync-complete', this.status);
        }
        catch (error) {
            console.error('Sync error:', error);
            this.status.errors.push(error.message);
            this.emit('sync-error', error);
        }
        finally {
            this.status.isSyncing = false;
        }
    }
    /**
     * Apply server update to local database
     */
    async applyUpdate(item) {
        // This would interact with local storage
        // For now, just emit event
        this.emit('item-updated', item);
    }
    /**
     * Apply server deletion to local database
     */
    async applyDeletion(itemId) {
        // This would interact with local storage
        this.emit('item-deleted', itemId);
    }
    /**
     * Get local changes since last sync
     */
    async getLocalChanges(vaultId, since) {
        // This would query local database
        // For now, return empty array
        return [];
    }
    /**
     * Handle sync response from WebSocket
     */
    handleSyncResponse(message) {
        this.emit('sync-response', message);
    }
    /**
     * Handle item update from WebSocket
     */
    handleItemUpdate(message) {
        this.emit('remote-update', message.item);
    }
    /**
     * Schedule WebSocket reconnection
     */
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.reconnectTimer = null;
            this.connectWebSocket().catch((error) => {
                console.error('Reconnection failed:', error);
            });
        }, 5000); // Retry after 5 seconds
    }
    /**
     * Get current sync status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Disconnect and cleanup
     */
    async disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
/**
 * Create sync service instance
 */
export function createSyncService(config) {
    return new SyncService(config);
}
//# sourceMappingURL=sync-service.js.map