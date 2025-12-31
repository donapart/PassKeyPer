import React, { useState, useEffect } from 'react'
import { X, Activity, Clock, Shield, Search, Filter } from 'lucide-react'

interface AuditLog {
    id: string
    action: string
    resourceType: string
    details: string
    createdAt: string
    user?: {
        email: string
    }
}

interface AuditLogModalProps {
    isOpen: boolean
    onClose: () => void
    vaultId?: string
    vaultName?: string
}

export function AuditLogModal({ isOpen, onClose, vaultId, vaultName }: AuditLogModalProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadLogs()
        }
    }, [isOpen, vaultId])

    const loadLogs = async () => {
        setIsLoading(true)
        try {
            // In a real app, this would call window.electronAPI.getAuditLogs(vaultId)
            // For now, we mock data
            setTimeout(() => {
                setLogs([
                    {
                        id: '1',
                        action: 'VAULT_OPENED',
                        resourceType: 'VAULT',
                        details: 'User unlocked the vault',
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        action: 'ITEM_CREATED',
                        resourceType: 'ITEM',
                        details: 'Created item "Github"',
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                        id: '3',
                        action: 'SHARE_INVITE_CREATED',
                        resourceType: 'VAULT',
                        details: 'Invited team@example.com with "read" permission',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    }
                ])
                setIsLoading(false)
            }, 500)
        } catch (error) {
            console.error('Failed to load logs', error)
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.details.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Activity Log</h2>
                            <p className="text-sm text-dark-400">{vaultName || 'Account Activity'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-dark-700 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter logs..."
                            className="input pl-10 w-full py-2 text-sm"
                        />
                    </div>
                    <button className="btn-secondary py-2 flex items-center gap-2 text-sm">
                        <Filter className="w-4 h-4" />
                        Type
                    </button>
                </div>

                {/* Logs List */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                            <p className="text-dark-400">No activity found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-700">
                            {filteredLogs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-dark-700/50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-dark-500">•</span>
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300">{log.details}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-dark-500 uppercase tracking-tighter">Resource</span>
                                            <span className="text-xs text-dark-400">{log.resourceType}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-700 flex justify-end">
                    <button onClick={onClose} className="btn-primary">
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
