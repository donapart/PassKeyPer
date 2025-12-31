/**
 * useSync Hook - Manages cloud synchronization
 */
import { useState, useEffect, useCallback } from 'react';
import { createSyncService } from '@passkeyper/sync';
import { useToast } from './useToast';
export function useSync(options = {}) {
    const { apiUrl = 'http://localhost:3000', wsUrl = 'ws://localhost:3000/ws', token = localStorage.getItem('auth_token') || '', deviceId = getDeviceId(), vaultId, autoSync = true, syncInterval = 60000 // 1 minute
     } = options;
    const [syncService] = useState(() => createSyncService({
        apiUrl,
        wsUrl,
        token,
        deviceId
    }));
    const [status, setStatus] = useState(syncService.getStatus());
    const [isConnected, setIsConnected] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const { toast } = useToast();
    // Initialize sync service
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                await syncService.initialize();
                if (mounted) {
                    setIsConnected(true);
                }
            }
            catch (error) {
                console.error('Sync init error:', error);
                if (mounted) {
                    setIsConnected(false);
                }
            }
        };
        init();
        return () => {
            mounted = false;
            syncService.disconnect();
        };
    }, [syncService]);
    // Listen to sync events
    useEffect(() => {
        const handleSyncStart = () => {
            setStatus(syncService.getStatus());
        };
        const handleSyncComplete = (newStatus) => {
            setStatus(newStatus);
            setLastSync(newStatus.lastSync);
            toast({
                type: 'success',
                message: `Synced ${newStatus.itemsUpdated} items`
            });
        };
        const handleSyncError = (error) => {
            setStatus(syncService.getStatus());
            toast({
                type: 'error',
                message: `Sync failed: ${error.message}`
            });
        };
        const handleConflict = (conflict) => {
            const { conflicts, setConflicts } = useAppStore.getState();
            // Add to existing conflicts if not present
            const exists = conflicts.some(c => c.itemId === conflict.itemId);
            if (!exists) {
                setConflicts([...conflicts, conflict]);
                toast({
                    type: 'warning',
                    message: 'Conflict detected - review required'
                });
            }
        };
        const handleAuthenticated = () => {
            setIsConnected(true);
        };
        const handleDisconnected = () => {
            setIsConnected(false);
        };
        const handleRemoteUpdate = (item) => {
            // Emit custom event for app to handle
            window.dispatchEvent(new CustomEvent('sync:remote-update', {
                detail: item
            }));
        };
        syncService.on('sync-start', handleSyncStart);
        syncService.on('sync-complete', handleSyncComplete);
        syncService.on('sync-error', handleSyncError);
        syncService.on('conflict', handleConflict);
        syncService.on('authenticated', handleAuthenticated);
        syncService.on('disconnected', handleDisconnected);
        syncService.on('remote-update', handleRemoteUpdate);
        return () => {
            syncService.off('sync-start', handleSyncStart);
            syncService.off('sync-complete', handleSyncComplete);
            syncService.off('sync-error', handleSyncError);
            syncService.off('conflict', handleConflict);
            syncService.off('authenticated', handleAuthenticated);
            syncService.off('disconnected', handleDisconnected);
            syncService.off('remote-update', handleRemoteUpdate);
        };
    }, [syncService, toast]);
    // Auto-sync interval
    useEffect(() => {
        if (!autoSync || !vaultId || !isConnected)
            return;
        const interval = setInterval(() => {
            sync();
        }, syncInterval);
        return () => clearInterval(interval);
    }, [autoSync, vaultId, isConnected, syncInterval]);
    // Manual sync function
    const sync = useCallback(async () => {
        if (!vaultId) {
            toast({ type: 'error', message: 'No vault selected' });
            return;
        }
        try {
            await syncService.sync(vaultId);
        }
        catch (error) {
            console.error('Sync error:', error);
        }
    }, [vaultId, syncService, toast]);
    return {
        sync,
        status,
        isConnected,
        lastSync,
        isSyncing: status.isSyncing,
        errors: status.errors,
        itemsUpdated: status.itemsUpdated,
        itemsConflicted: status.itemsConflicted,
        resolveConflict: async (itemId, resolution) => {
            if (syncService) {
                await syncService.resolveConflict(itemId, resolution);
            }
        }
    };
}
// Helper to get or create device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateDeviceId();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}
function generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=useSync.js.map