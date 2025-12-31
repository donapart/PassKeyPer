/**
 * Sync Service Package
 * Handles cloud synchronization for desktop app
 */
import { EventEmitter } from 'events';
interface SyncConfig {
    apiUrl: string;
    wsUrl: string;
    token: string;
    deviceId: string;
}
interface SyncStatus {
    isSyncing: boolean;
    lastSync: Date | null;
    errors: string[];
    itemsUpdated: number;
    itemsConflicted: number;
}
export declare class SyncService extends EventEmitter {
    private config;
    private ws;
    private status;
    private reconnectTimer;
    constructor(config: SyncConfig);
    /**
     * Initialize sync service
     */
    initialize(): Promise<void>;
    /**
     * Connect to WebSocket server
     */
    private connectWebSocket;
    /**
     * Authenticate WebSocket connection
     */
    private authenticate;
    /**
     * Handle incoming WebSocket message
     */
    private handleMessage;
    /**
     * Pull updates from server
     */
    pullUpdates(vaultId: string, lastSyncTimestamp: number): Promise<any>;
    /**
     * Push local changes to server
     */
    pushChanges(vaultId: string, items: any[]): Promise<any>;
    /**
     * Perform full sync
     */
    sync(vaultId: string): Promise<void>;
    /**
     * Apply server update to local database
     */
    private applyUpdate;
    /**
     * Apply server deletion to local database
     */
    private applyDeletion;
    /**
     * Get local changes since last sync
     */
    private getLocalChanges;
    /**
     * Handle sync response from WebSocket
     */
    private handleSyncResponse;
    /**
     * Handle item update from WebSocket
     */
    private handleItemUpdate;
    /**
     * Schedule WebSocket reconnection
     */
    private scheduleReconnect;
    /**
     * Get current sync status
     */
    getStatus(): SyncStatus;
    /**
     * Disconnect and cleanup
     */
    disconnect(): Promise<void>;
}
/**
 * Create sync service instance
 */
export declare function createSyncService(config: SyncConfig): SyncService;
export {};
//# sourceMappingURL=sync-service.d.ts.map