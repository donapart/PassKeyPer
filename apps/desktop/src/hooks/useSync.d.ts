/**
 * useSync Hook - Manages cloud synchronization
 */
interface UseSyncOptions {
    apiUrl?: string;
    wsUrl?: string;
    token?: string;
    deviceId?: string;
    vaultId?: string;
    autoSync?: boolean;
    syncInterval?: number;
}
export declare function useSync(options?: UseSyncOptions): {
    sync: () => Promise<void>;
    status: SyncStatus;
    isConnected: boolean;
    lastSync: Date | null;
    isSyncing: any;
    errors: any;
    itemsUpdated: any;
    itemsConflicted: any;
    resolveConflict: (itemId: string, resolution: "local" | "server" | "merge") => Promise<void>;
};
export {};
//# sourceMappingURL=useSync.d.ts.map