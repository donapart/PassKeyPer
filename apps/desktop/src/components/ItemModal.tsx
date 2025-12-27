import React, { useState, useEffect } from 'react'
import { X, Key, Shuffle, Copy, Check, Eye, EyeOff } from 'lucide-react'
import type { LoginItem } from '@passkeyper/core'
import { toast } from './Toast'


interface ItemModalProps {
    isOpen: boolean
    onClose: () => void
    vaultId: string
    editItem?: any // Existing item for editing
    onSave: () => void
}

export function ItemModal({ isOpen, onClose, vaultId, editItem, onSave }: ItemModalProps) {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [url, setUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [showGenerator, setShowGenerator] = useState(false)

    useEffect(() => {
        if (editItem) {
            // Load existing item data
            setName(editItem.name || '')
            setUsername(editItem.username || '')
            setPassword(editItem.password || '')
            setUrl(editItem.urls?.[0] || '')
            setNotes(editItem.notes || '')
        } else {
            // Reset for new item
            setName('')
            setUsername('')
            setPassword('')
            setUrl('')
            setNotes('')
        }
    }, [editItem, isOpen])

    const handleGeneratePassword = async () => {
        const generated = await window.electronAPI.generatePassword({
            length: 20,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: true,
        })
        setPassword(generated)
    }

    const handleCopy = (field: string, value: string) => {
        navigator.clipboard.writeText(value)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleSave = async () => {
        if (!name.trim() || !password.trim()) {
            toast.warning('Name and password are required!')
            return
        }

        setIsSaving(true)

        try {
            const itemData: LoginItem = {
                type: 'login',
                name: name.trim(),
                username: username.trim(),
                password: password,
                urls: url.trim() ? [url.trim()] : [],
                notes: notes.trim(),
                customFields: [],
                passwordHistory: [],
            }

            if (editItem) {
                await window.electronAPI.updateItem(editItem.id, itemData)
                toast.success('Item updated successfully')
            } else {
                await window.electronAPI.createItem(vaultId, itemData)
                toast.success('Item created successfully')
            }

            onSave()
            onClose()
        } catch (error: any) {
            toast.error('Failed to save item: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {editItem ? 'Edit Login' : 'New Login'}
                            </h2>
                            <p className="text-sm text-dark-400">Securely store your credentials</p>
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
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., GitHub Account"
                            className="input w-full"
                            autoFocus
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Website URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="input w-full"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username / Email
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="user@example.com"
                                className="input w-full pr-10"
                            />
                            {username && (
                                <button
                                    onClick={() => handleCopy('username', username)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-700 rounded transition-colors"
                                >
                                    {copiedField === 'username' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-dark-400" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password *
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input w-full pr-20"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-2 hover:bg-dark-700 rounded transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-dark-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-dark-400" />
                                        )}
                                    </button>
                                    {password && (
                                        <button
                                            onClick={() => handleCopy('password', password)}
                                            className="p-2 hover:bg-dark-700 rounded transition-colors"
                                        >
                                            {copiedField === 'password' ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-dark-400" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleGeneratePassword}
                                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                            >
                                <Shuffle className="w-4 h-4" />
                                Generate
                            </button>
                        </div>
                        {password && <PasswordStrengthBar password={password} />}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes..."
                            className="input w-full min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim() || !password.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : editItem ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Password strength indicator
function PasswordStrengthBar({ password }: { password: string }) {
    const [strength, setStrength] = useState<any>(null)

    useEffect(() => {
        if (password) {
            window.electronAPI.calculateStrength(password).then(setStrength)
        }
    }, [password])

    if (!strength) return null

    const getColor = (score: number) => {
        if (score < 30) return 'bg-red-500'
        if (score < 60) return 'bg-yellow-500'
        if (score < 80) return 'bg-blue-500'
        return 'bg-green-500'
    }

    const getLabel = (score: number) => {
        if (score < 30) return 'Weak'
        if (score < 60) return 'Fair'
        if (score < 80) return 'Good'
        return 'Strong'
    }

    return (
        <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Strength: {getLabel(strength.score)}</span>
                <span className="text-dark-400">{strength.entropy} bits entropy</span>
            </div>
            <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all ${getColor(strength.score)}`}
                    style={{ width: `${strength.score}%` }}
                />
            </div>
            {strength.warnings.length > 0 && (
                <p className="text-xs text-yellow-500">{strength.warnings[0]}</p>
            )}
        </div>
    )
}
