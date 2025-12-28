export { SyncService, createSyncService } from './sync-service'
export type { SyncConfig, SyncStatus } from './sync-service'

// Re-export types for convenience
export interface SyncConfig {
    apiUrl: string
    wsUrl: string
    token: string
    deviceId: string
}

export interface SyncStatus {
    isSyncing: boolean
    lastSync: Date | null
    errors: string[]
    itemsUpdated: number
    itemsConflicted: number
}
