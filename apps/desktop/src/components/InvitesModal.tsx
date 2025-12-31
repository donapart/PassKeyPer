import React, { useState, useEffect } from 'react'
import { X, Mail, Check, Trash2, Shield, Calendar } from 'lucide-react'
import { toast } from './Toast'

interface Invite {
    id: string
    token: string
    inviter: { email: string }
    vault: { name: string }
    permission: string
    expiresAt: string
}

interface InvitesModalProps {
    isOpen: boolean
    onClose: () => void
    onRefresh?: () => void
}

export function InvitesModal({ isOpen, onClose, onRefresh }: InvitesModalProps) {
    const [invites, setInvites] = useState<Invite[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            loadInvites()
        }
    }, [isOpen])

    const loadInvites = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('auth_token') || ''
            const result = await window.electronAPI.listInvites('received', token)
            setInvites(result)
        } catch (error) {
            console.error('Failed to load invites', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAccept = async (token: string) => {
        try {
            const authToken = localStorage.getItem('auth_token') || ''
            await window.electronAPI.acceptInvite(token, authToken)
            toast.success('Invitation accepted!')
            setInvites(invites.filter(i => i.token !== token))
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept invitation')
        }
    }

    const handleDecline = async (id: string) => {
        // Implement decline logic
        setInvites(invites.filter(i => i.id !== id))
        toast.info('Invitation declined')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg animate-slideUp overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Pending Invitations</h2>
                            <p className="text-sm text-dark-400">Manage vault sharing invites</p>
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
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : invites.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-300">No pending invites</h3>
                            <p className="text-dark-400">When someone shares a vault with you, it will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="p-4 bg-dark-900/50 border border-dark-700 rounded-xl space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Share for <span className="text-primary-400">{invite.vault.name}</span>
                                                </p>
                                                <p className="text-xs text-dark-400">From: {invite.inviter.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark-500 block mb-1">Permission</span>
                                            <span className="text-xs font-medium text-gray-300 bg-dark-700 px-2 py-1 rounded">
                                                {invite.permission}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-dark-400">
                                        <Calendar className="w-3 h-3" />
                                        Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-dark-700">
                                        <button
                                            onClick={() => handleAccept(invite.token)}
                                            className="btn-primary py-2 flex-1 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Check className="w-4 h-4" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleDecline(invite.id)}
                                            className="btn-secondary py-2 flex-1 flex items-center justify-center gap-2 text-sm text-red-400 border-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
