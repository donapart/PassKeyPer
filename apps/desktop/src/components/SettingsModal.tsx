import React, { useState } from 'react'
import { X, Lock, Clock, Keyboard, Bell, Shield, Database, Cloud } from 'lucide-react'
import { useAppStore } from '../store/app-store'
import { toast } from './Toast'
import { TwoFactorSetupModal } from './TwoFactorSetupModal'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { syncSettings, setSyncSettings, setShowImportModal, setShowExportModal } = useAppStore()

    const [autoLockMinutes, setAutoLockMinutes] = useState(parseInt(localStorage.getItem('autoLockMinutes') || '15'))
    const [clipboardTimeout, setClipboardTimeout] = useState(parseInt(localStorage.getItem('clipboardTimeout') || '30'))
    const [showNotifications, setShowNotifications] = useState(localStorage.getItem('showNotifications') !== 'false')

    // Sync Settings (local state for form, init from store)
    const [syncApiUrl, setSyncApiUrl] = useState(syncSettings.apiUrl)
    const [autoSync, setAutoSync] = useState(syncSettings.autoSync)
    const [syncInterval, setSyncInterval] = useState(syncSettings.syncInterval)
    const { user, setUser } = useAppStore()
    const [show2FAModal, setShow2FAModal] = useState(false)

    const handleSave = () => {
        // Save settings to localStorage
        localStorage.setItem('autoLockMinutes', autoLockMinutes.toString())
        localStorage.setItem('clipboardTimeout', clipboardTimeout.toString())
        localStorage.setItem('showNotifications', showNotifications.toString())

        // Save Sync Settings to Store (handles localStorage internally)
        setSyncSettings({
            apiUrl: syncApiUrl,
            autoSync,
            syncInterval
        })

        toast.success('Settings saved successfully')
        onClose()
    }

    const handleExportVault = async () => {
        setShowExportModal(true)
        onClose()
    }

    const handleImportVault = async () => {
        setShowImportModal(true)
        onClose()
    }

    const handle2FASuccess = async () => {
        // Refresh user info to update 2FA status
        try {
            const token = localStorage.getItem('auth_token') || ''
            const result = await window.electronAPI.getMe(token)
            if (result.user) {
                setUser({
                    ...result.user,
                    salt: user?.salt || ''
                })
            }
        } catch (error) {
            console.error('Failed to refresh user info', error)
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
                            <Shield className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Settings</h2>
                            <p className="text-sm text-dark-400">Configure PassKeyPer</p>
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
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Security Settings */}
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary-400" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            {/* Auto-lock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Auto-lock after inactivity
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="5"
                                        max="60"
                                        step="5"
                                        value={autoLockMinutes}
                                        onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-primary-400 font-medium w-20 text-right">
                                        {autoLockMinutes} min
                                    </span>
                                </div>
                                <p className="text-xs text-dark-400 mt-1">
                                    Automatically lock vault after this period of inactivity
                                </p>
                            </div>

                            {/* Clipboard timeout */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Clear clipboard after
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="10"
                                        max="120"
                                        step="10"
                                        value={clipboardTimeout}
                                        onChange={(e) => setClipboardTimeout(parseInt(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-primary-400 font-medium w-20 text-right">
                                        {clipboardTimeout}s
                                    </span>
                                </div>
                                <p className="text-xs text-dark-400 mt-1">
                                    Automatically clear clipboard after copying password
                                </p>
                            </div>

                            {/* 2FA Status */}
                            <div className="pt-4 border-t border-dark-700/50">
                                <div className="flex items-center justify-between p-4 bg-dark-900/40 rounded-xl border border-dark-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user?.twoFactorEnabled ? 'bg-green-600/20' : 'bg-amber-600/20'
                                            }`}>
                                            <Smartphone className={`w-5 h-5 ${user?.twoFactorEnabled ? 'text-green-400' : 'text-amber-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${user?.twoFactorEnabled ? 'text-green-500' : 'text-amber-500'
                                                }`}>
                                                {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShow2FAModal(true)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${user?.twoFactorEnabled
                                            ? 'bg-dark-700 hover:bg-dark-600 text-white'
                                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20'
                                            }`}
                                    >
                                        {user?.twoFactorEnabled ? 'Manage' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-400" />
                            Notifications
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showNotifications}
                                    onChange={(e) => setShowNotifications(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-300">
                                        Show notifications
                                    </p>
                                    <p className="text-xs text-dark-400">
                                        Display toast notifications for actions
                                    </p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Keyboard Shortcuts */}
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-primary-400" />
                            Keyboard Shortcuts
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-dark-700">
                                <span className="text-gray-300">Search</span>
                                <kbd className="px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs">
                                    Ctrl+F
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-dark-700">
                                <span className="text-gray-300">New Item</span>
                                <kbd className="px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs">
                                    Ctrl+N
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-dark-700">
                                <span className="text-gray-300">Lock Vault</span>
                                <kbd className="px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs">
                                    Ctrl+L
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-300">Settings</span>
                                <kbd className="px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs">
                                    Ctrl+,
                                </kbd>
                            </div>
                        </div>
                    </section>


                    {/* Cloud Sync */}
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-primary-400" />
                            Cloud Sync
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Server URL
                                </label>
                                <input
                                    type="text"
                                    value={syncApiUrl}
                                    onChange={(e) => setSyncApiUrl(e.target.value)}
                                    className="input w-full"
                                    placeholder="http://localhost:3000"
                                />
                                <p className="text-xs text-dark-400 mt-1">
                                    URL of the synchronization server (REST + WebSocket)
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoSync}
                                        onChange={(e) => setAutoSync(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-300">
                                        Enable Auto-Sync
                                    </span>
                                </label>
                            </div>

                            {autoSync && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sync Interval
                                    </label>
                                    <select
                                        value={syncInterval}
                                        onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                                        className="input w-full"
                                    >
                                        <option value={15000}>Every 15 seconds</option>
                                        <option value={30000}>Every 30 seconds</option>
                                        <option value={60000}>Every minute</option>
                                        <option value={300000}>Every 5 minutes</option>
                                        <option value={900000}>Every 15 minutes</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Data Management */}
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary-400" />
                            Data Management
                        </h3>
                        <div className="flex gap-3">
                            <button onClick={handleExportVault} className="btn-secondary flex-1">
                                Export Vault
                            </button>
                            <button onClick={handleImportVault} className="btn-secondary flex-1">
                                Import Vault
                            </button>
                        </div>
                        <p className="text-xs text-dark-400 mt-2">
                            Backup your vault or import from other password managers
                        </p>
                    </section>

                    {/* About */}
                    <section className="pt-6 border-t border-dark-700">
                        <div className="text-sm text-dark-400 space-y-1">
                            <p>
                                <strong className="text-gray-300">PassKeyPer</strong> v0.1.0
                            </p>
                            <p>Zero-knowledge password manager</p>
                            <p className="text-xs">
                                Licensed under AGPL-3.0 • Open Source
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary">
                        Save Settings
                    </button>
                </div>
            </div>

            <TwoFactorSetupModal
                isOpen={show2FAModal}
                onClose={() => setShow2FAModal(false)}
                onSuccess={handle2FASuccess}
                isAlreadyEnabled={user?.twoFactorEnabled}
            />
        </div>
    )
}
