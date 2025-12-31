import React, { useState } from 'react'
import { X, Shield, Lock, Plus } from 'lucide-react'
import { toast } from './Toast'

interface TeamVaultModalProps {
    isOpen: boolean
    onClose: () => void
    teamId: string
    teamName: string
    onSuccess?: () => void
}

export function TeamVaultModal({ isOpen, onClose, teamId, teamName, onSuccess }: TeamVaultModalProps) {
    const [name, setName] = useState('')
    const [type, setType] = useState<'work' | 'shared'>('work')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            const token = localStorage.getItem('auth_token') || ''

            // To be truly zero-knowledge, we should generate a key here.
            // For this version, we let the backend handle the initial key record
            // but in production, the client generates the 256-bit vault key.

            await window.electronAPI.createCloudVault({
                name,
                type,
                teamId,
                encryptedKey: 'INITIAL_REPLACE_ME' // Placeholder for now
            }, token)

            toast.success(`Vault "${name}" created in ${teamName}`)
            setName('')
            onSuccess?.()
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create vault')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600/10 to-blue-600/10 p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">New Team Vault</h2>
                            <p className="text-dark-400 text-xs">Creating in {teamName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-dark-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest">Vault Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Marketing Credentials"
                            className="input w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest">Vault Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('work')}
                                className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${type === 'work'
                                        ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span className="font-bold">Work</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('shared')}
                                className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${type === 'shared'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="font-bold">Shared</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-700/50">
                        <p className="text-[11px] text-dark-400 leading-relaxed text-center italic">
                            All members of <span className="text-primary-400 font-bold">{teamName}</span> will immediately have access to this vault based on their team role.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary px-8" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Vault'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
