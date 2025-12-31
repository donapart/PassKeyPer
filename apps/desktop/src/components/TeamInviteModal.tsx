import React, { useState } from 'react'
import { X, Mail, Shield, UserPlus } from 'lucide-react'
import { toast } from './Toast'

interface TeamInviteModalProps {
    isOpen: boolean
    onClose: () => void
    teamId: string
    teamName: string
    onSuccess?: () => void
}

export function TeamInviteModal({ isOpen, onClose, teamId, teamName, onSuccess }: TeamInviteModalProps) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('MEMBER')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsSubmitting(true)
        try {
            const token = localStorage.getItem('auth_token') || ''
            await window.electronAPI.addTeamMember(teamId, email, role, token)

            toast.success(`Invitation sent to ${email}`)
            setEmail('')
            onSuccess?.()
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to add member')
        } finally {
            setIsSubmitting(false)
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
                            <UserPlus className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                            <p className="text-dark-400 text-sm">{teamName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 font-mono uppercase tracking-tighter">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="input pl-11 w-full"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 font-mono uppercase tracking-tighter">Role</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('MEMBER')}
                                className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${role === 'MEMBER'
                                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <span className="font-bold">Member</span>
                                <span className="text-[10px] opacity-75">Standard access</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ADMIN')}
                                className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${role === 'ADMIN'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                <span className="font-bold">Admin</span>
                                <span className="text-[10px] opacity-75">Full management</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-dark-500 bg-dark-900 p-3 rounded-lg">
                        Members will be able to access all vaults associated with this team once they accept the invitation.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 font-mono">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-8"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
