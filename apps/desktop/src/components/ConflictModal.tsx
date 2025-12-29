/**
 * ConflictModal - Resolve sync conflicts
 */

import React, { useState } from 'react'
import { X, AlertTriangle, ArrowRight, Check } from 'lucide-react'
import { useToast } from '../hooks/useToast'

interface ConflictData {
    id: string
    itemId: string
    name: string
    localVersion: {
        version: number
        updatedAt: Date
        data: any
    }
    serverVersion: {
        version: number
        updatedAt: Date
        data: any
    }
}

interface ConflictModalProps {
    isOpen: boolean
    onClose: () => void
    conflicts: ConflictData[]
    onResolve: (itemId: string, resolution: 'local' | 'server' | 'merge') => void
}

export function ConflictModal({ isOpen, onClose, conflicts, onResolve }: ConflictModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [resolution, setResolution] = useState<'local' | 'server' | 'merge' | null>(null)
    const { toast } = useToast()

    if (!isOpen || conflicts.length === 0) return null

    const currentConflict = conflicts[currentIndex]
    const hasMore = currentIndex < conflicts.length - 1

    const handleResolve = async () => {
        if (!resolution) {
            toast({ type: 'error', message: 'Please select a resolution' })
            return
        }

        try {
            await onResolve(currentConflict.itemId, resolution)

            if (hasMore) {
                setCurrentIndex(currentIndex + 1)
                setResolution(null)
            } else {
                toast({ type: 'success', message: 'All conflicts resolved!' })
                onClose()
            }
        } catch (error: any) {
            toast({ type: 'error', message: `Failed to resolve: ${error.message}` })
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString()
    }

    const getDiff = (local: any, server: any) => {
        const diff: string[] = []

        // Compare basic fields
        if (local.username !== server.username) {
            diff.push(`Username: "${local.username}" vs "${server.username}"`)
        }
        if (local.password !== server.password) {
            diff.push('Password: Different')
        }
        if (local.notes !== server.notes) {
            diff.push('Notes: Different')
        }

        return diff
    }

    const differences = getDiff(
        currentConflict.localVersion.data,
        currentConflict.serverVersion.data
    )

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <div>
                            <h2 className="text-xl font-semibold">Resolve Conflict</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Conflict {currentIndex + 1} of {conflicts.length}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Item Info */}
                    <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                        <h3 className="font-semibold mb-2">{currentConflict.name}</h3>
                        <p className="text-sm text-gray-400">
                            This item was modified on both this device and the server.
                            Choose which version to keep.
                        </p>
                    </div>

                    {/* Differences */}
                    {differences.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">Changes:</h4>
                            <ul className="space-y-1">
                                {differences.map((diff, i) => (
                                    <li key={i} className="text-sm text-gray-400">
                                        • {diff}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Local Version */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${resolution === 'local'
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-dark-700 hover:border-dark-600'
                                }`}
                            onClick={() => setResolution('local')}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-blue-400">Local Version</h4>
                                {resolution === 'local' && (
                                    <Check className="w-5 h-5 text-blue-400" />
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Version:</span>{' '}
                                    <span className="text-white">
                                        {currentConflict.localVersion.version}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Modified:</span>{' '}
                                    <span className="text-white">
                                        {formatDate(currentConflict.localVersion.updatedAt)}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-dark-700">
                                    <div className="text-gray-500 mb-1">Username:</div>
                                    <div className="text-white font-mono text-xs">
                                        {currentConflict.localVersion.data.username || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Server Version */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${resolution === 'server'
                                    ? 'border-emerald-500 bg-emerald-900/20'
                                    : 'border-dark-700 hover:border-dark-600'
                                }`}
                            onClick={() => setResolution('server')}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-emerald-400">Server Version</h4>
                                {resolution === 'server' && (
                                    <Check className="w-5 h-5 text-emerald-400" />
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Version:</span>{' '}
                                    <span className="text-white">
                                        {currentConflict.serverVersion.version}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Modified:</span>{' '}
                                    <span className="text-white">
                                        {formatDate(currentConflict.serverVersion.updatedAt)}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-dark-700">
                                    <div className="text-gray-500 mb-1">Username:</div>
                                    <div className="text-white font-mono text-xs">
                                        {currentConflict.serverVersion.data.username || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Merge Option (Advanced) */}
                    <div className="mb-6">
                        <button
                            onClick={() => setResolution('merge')}
                            className={`w-full p-3 border rounded-lg text-left transition-all ${resolution === 'merge'
                                    ? 'border-purple-500 bg-purple-900/20'
                                    : 'border-dark-700 hover:border-dark-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-purple-400">
                                        Merge Manually
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Review and edit the item yourself
                                    </p>
                                </div>
                                {resolution === 'merge' && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleResolve}
                            disabled={!resolution}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {hasMore ? (
                                <>
                                    Resolve & Next
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Resolve & Finish
                                    <Check className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
