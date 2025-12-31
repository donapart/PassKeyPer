import React, { useState } from 'react'
import { X, UserPlus, Users, Shield, Trash2, Send } from 'lucide-react'
import { toast } from './Toast'

interface ShareVaultModalProps {
    isOpen: boolean
    onClose: () => void
    vaultId: string
    vaultName: string
}

export function ShareVaultModal({ isOpen, onClose, vaultId, vaultName }: ShareVaultModalProps) {
    const [email, setEmail] = useState('')
    const [permission, setPermission] = useState('read')
    const [isLoading, setIsLoading] = useState(false)

    // Mock data for currently shared users - in real app, fetch from API
    const [shares, setShares] = useState([
        { id: '1', email: 'owner@example.com', permission: 'owner' },
    ])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsLoading(true)
        try {
            // In a real app, this would call the API
            // For now, we mock the success
            // Invitation will be handled by API call

            // Simulating API call
            // await window.electronAPI.inviteToVault(vaultId, email, permission)

            toast.success(`Invite sent to ${email}`)
            setEmail('')
        } catch (error: any) {
            toast.error(error.message || 'Failed to send invite')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Share Vault</h2>
                            <p className="text-sm text-dark-400">{vaultName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Invite Form */}
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Invite by Email
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="input flex-1"
                                    required
                                />
                                <select
                                    className="input w-32"
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                >
                                    <option value="read">Read</option>
                                    <option value="write">Write</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </form>

                    {/* Current Shares */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                            Who has access
                        </h3>
                        <div className="space-y-2">
                            {shares.map((share) => (
                                <div
                                    key={share.id}
                                    className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg border border-dark-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">
                                            {share.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{share.email}</p>
                                            <p className="text-xs text-dark-400 capitalize">{share.permission}</p>
                                        </div>
                                    </div>
                                    {share.permission !== 'owner' && (
                                        <button className="text-dark-400 hover:text-red-400 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-700 flex justify-end">
                    <button onClick={onClose} className="btn-ghost">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
