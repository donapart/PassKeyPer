import React, { useState, useEffect } from 'react'
import { X, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from './Toast'

interface SecurityPolicyModalProps {
    isOpen: boolean
    onClose: () => void
    team: any
    onSuccess?: () => void
}

export function SecurityPolicyModal({ isOpen, onClose, team, onSuccess }: SecurityPolicyModalProps) {
    const [policy, setPolicy] = useState({
        minPasswordLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        twoFactorRequired: false,
        autoLockTimeout: 15
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (team?.policy) {
            setPolicy({
                minPasswordLength: team.policy.minPasswordLength ?? 12,
                requireUppercase: team.policy.requireUppercase ?? true,
                requireLowercase: team.policy.requireLowercase ?? true,
                requireNumbers: team.policy.requireNumbers ?? true,
                requireSymbols: team.policy.requireSymbols ?? true,
                twoFactorRequired: team.policy.twoFactorRequired ?? false,
                autoLockTimeout: team.policy.autoLockTimeout ?? 15
            })
        }
    }, [team])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('auth_token') || ''
            await window.electronAPI.updateTeamPolicy(team.id, policy, token)
            toast.success('Security policy updated successfully')
            onSuccess?.()
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update policy')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg animate-slideUp overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-primary-600/20 to-blue-600/20 p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center border border-primary-500/30">
                            <Shield className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Security Policies</h2>
                            <p className="text-dark-400 text-xs">Enforce rules for all team members</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-8">
                    {/* Password Complexity */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                            Password Complexity
                        </h3>

                        <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-dark-700/50">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-white">Minimum Length</label>
                                    <span className="text-primary-400 font-mono font-bold">{policy.minPasswordLength} Characters</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="64"
                                    value={policy.minPasswordLength}
                                    onChange={(e) => setPolicy({ ...policy, minPasswordLength: parseInt(e.target.value) })}
                                    className="w-full accent-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'requireUppercase', label: 'Uppercase (A-Z)' },
                                    { id: 'requireLowercase', label: 'Lowercase (a-z)' },
                                    { id: 'requireNumbers', label: 'Numbers (0-9)' },
                                    { id: 'requireSymbols', label: 'Symbols (!@#$)' }
                                ].map((req) => (
                                    <label key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-dark-700 cursor-pointer hover:border-dark-600 transition-colors">
                                        <span className="text-xs text-dark-300">{req.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={(policy as any)[req.id]}
                                            onChange={(e) => setPolicy({ ...policy, [req.id]: e.target.checked })}
                                            className="w-4 h-4 accent-primary-500 rounded"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Access Control */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                            Access Control
                        </h3>

                        <div className="space-y-4">
                            <label className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${policy.twoFactorRequired
                                    ? 'bg-primary-900/10 border-primary-500/30'
                                    : 'bg-dark-900/40 border-dark-700/50 hover:border-dark-600'
                                }`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${policy.twoFactorRequired ? 'bg-primary-500/20' : 'bg-dark-800'
                                    }`}>
                                    <CheckCircle2 className={`w-5 h-5 ${policy.twoFactorRequired ? 'text-primary-400' : 'text-dark-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white">Enforce 2FA</span>
                                        <input
                                            type="checkbox"
                                            checked={policy.twoFactorRequired}
                                            onChange={(e) => setPolicy({ ...policy, twoFactorRequired: e.target.checked })}
                                            className="w-5 h-5 accent-primary-500"
                                        />
                                    </div>
                                    <p className="text-xs text-dark-400 mt-1">Requires all team members to enable Two-Factor Authentication to access shared vaults.</p>
                                </div>
                            </label>

                            <div className="bg-dark-900/40 p-4 rounded-xl border border-dark-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-white text-sm">Auto-Lock Timeout</span>
                                        <p className="text-[10px] text-dark-500 uppercase tracking-wider">Minutes of inactivity</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        value={policy.autoLockTimeout}
                                        onChange={(e) => setPolicy({ ...policy, autoLockTimeout: parseInt(e.target.value) || 15 })}
                                        className="input w-24 text-center font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-200/70 leading-relaxed">
                            Changes to security policies are applied immediately to all team members.
                            Stricter password rules will only affect newly created or updated items.
                        </p>
                    </div>
                </form>

                <div className="p-6 border-t border-dark-700 bg-dark-800/50 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost font-mono">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-primary flex items-center gap-2 px-8 font-mono shadow-lg shadow-primary-900/20"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Enforce Policy
                    </button>
                </div>
            </div>
        </div>
    )
}
