/**
 * SyncStatusBar - Shows cloud sync status
 */

import React from 'react'
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react'
import { useSync } from '../hooks/useSync'
import { useAppStore } from '../store/app-store'

export interface SyncStatusBarProps {
    sync: () => Promise<void>
    isConnected: boolean
    isSyncing: boolean
    lastSync: Date | null
    errors: any[]
    itemsUpdated: number
    itemsConflicted: number
}

export function SyncStatusBar({
    sync,
    isConnected,
    isSyncing,
    lastSync,
    errors,
    itemsUpdated,
    itemsConflicted
}: SyncStatusBarProps) {
    const { currentVault } = useAppStore()

    const formatLastSync = (date: Date | null) => {
        if (!date) return 'Never'

        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (seconds < 60) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return date.toLocaleDateString()
    }

    if (!currentVault) return null

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-dark-850 border-t border-dark-700">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
                {isConnected ? (
                    <Cloud className="w-4 h-4 text-emerald-400" />
                ) : (
                    <CloudOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-xs text-gray-400">
                    {isConnected ? 'Connected' : 'Offline'}
                </span>
            </div>

            {/* Sync Status */}
            {isSyncing && (
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs text-blue-400">Syncing...</span>
                </div>
            )}

            {/* Last Sync */}
            {!isSyncing && lastSync && (
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-400">
                        Last sync: {formatLastSync(lastSync)}
                    </span>
                </div>
            )}

            {/* Conflicts */}
            {itemsConflicted > 0 && (
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">
                        {itemsConflicted} conflicts
                    </span>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">
                        Sync error
                    </span>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Manual Sync Button */}
            <button
                onClick={() => sync()}
                disabled={!isConnected || isSyncing}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:text-gray-600 rounded transition-colors"
                title="Sync now"
            >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
            </button>
        </div>
    )
}
