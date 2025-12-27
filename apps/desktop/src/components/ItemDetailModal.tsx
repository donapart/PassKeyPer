import React, { useEffect, useState } from 'react'
import { X, Copy, Check, Eye, EyeOff, Star, Trash2, Edit2, ExternalLink } from 'lucide-react'

interface ItemDetailModalProps {
    isOpen: boolean
    onClose: () => void
    itemId: string
    onEdit: () => void
    onDelete: () => void
}

export function ItemDetailModal({ isOpen, onClose, itemId, onEdit, onDelete }: ItemDetailModalProps) {
    const [item, setItem] = useState<any>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen && itemId) {
            loadItem()
        }
    }, [isOpen, itemId])

    const loadItem = async () => {
        setIsLoading(true)
        try {
            const data = await window.electronAPI.getItem(itemId)
            setItem(data)
        } catch (error) {
            console.error('Failed to load item:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = (field: string, value: string) => {
        navigator.clipboard.writeText(value)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleToggleFavorite = async () => {
        await window.electronAPI.toggleFavorite(itemId)
        loadItem()
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item? This cannot be undone.')) {
            await window.electronAPI.deleteItem(itemId)
            onDelete()
            onClose()
        }
    }

    const handleOpenUrl = (url: string) => {
        // In Electron, you'd use shell.openExternal
        window.open(url, '_blank')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">
                            {item?.name || 'Loading...'}
                        </h2>
                        <button
                            onClick={handleToggleFavorite}
                            className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <Star
                                className={`w-5 h-5 ${item?.metadata?.favorite
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-dark-400'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4 text-dark-400" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-8 h-8 flex items-center justify-center hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-dark-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : item ? (
                    <div className="flex-1 overflow-auto p-6 space-y-6">
                        {/* URL */}
                        {item.urls && item.urls.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Website
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm">
                                        {item.urls[0]}
                                    </div>
                                    <button
                                        onClick={() => handleOpenUrl(item.urls[0])}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Username */}
                        {item.username && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Username
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm">
                                        {item.username}
                                    </div>
                                    <button
                                        onClick={() => handleCopy('username', item.username)}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        {copiedField === 'username' ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        {item.password && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Password
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm">
                                        {showPassword ? item.password : '••••••••••••'}
                                    </div>
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="btn-secondary"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleCopy('password', item.password)}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        {copiedField === 'password' ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Notes
                                </label>
                                <div className="px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">
                                    {item.notes}
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-6 border-t border-dark-700">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-dark-400">Created:</span>
                                    <span className="text-gray-300 ml-2">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-dark-400">Modified:</span>
                                    <span className="text-gray-300 ml-2">
                                        {new Date(item.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {item.lastUsedAt && (
                                    <div>
                                        <span className="text-dark-400">Last used:</span>
                                        <span className="text-gray-300 ml-2">
                                            {new Date(item.lastUsedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <p className="text-dark-400">Item not found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
