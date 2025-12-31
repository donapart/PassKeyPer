import React, { useState, useEffect } from 'react'
import pkpLogo from '../assets/pkp_logo.png'
import { KeyRound, ChevronDown, Plus, FolderPlus, Lock, Download, Upload, Mail, ShieldCheck, Users } from 'lucide-react'
import { useAppStore } from '../store/app-store'
import { InvitesModal } from './InvitesModal'

export function Sidebar() {
    const { vaults, currentVault, setCurrentVault, sidebarCollapsed, currentView, setCurrentView } = useAppStore()
    const [showVaultMenu, setShowVaultMenu] = useState(false)
    const [showInvitesModal, setShowInvitesModal] = useState(false)

    const [pendingInvitesCount, setPendingInvitesCount] = useState(0)

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const token = localStorage.getItem('auth_token') || ''
                const invites = await window.electronAPI.listInvites('received', token)
                setPendingInvitesCount(invites.length)
            } catch (e) {
                console.error('Failed to load invite count', e)
            }
        }
        loadCounts()
    }, [])

    const handleCreateVault = async () => {
        const name = prompt('Enter vault name:')
        if (!name) return

        try {
            const newVault = await window.electronAPI.createVault({
                userId: '', // Will be set by backend
                name,
                type: 'personal',
                encryptedKey: '', // Will be generated
            })

            // Reload vaults
            const vaults = await window.electronAPI.listVaults()
            useAppStore.setState({ vaults })

            // Select new vault
            setCurrentVault(newVault)
        } catch (error: any) {
            toast.error('Failed to create vault: ' + error.message)
        }
    }

    const handleLockVault = async () => {
        await window.electronAPI.lockVault()
        useAppStore.setState({ isLocked: true })
    }

    if (sidebarCollapsed) {
        return (
            <div className="w-16 bg-dark-900 border-r border-dark-800 flex flex-col items-center py-4">
                <div className="mb-4 mt-2">
                    <img src={pkpLogo} alt="PKP" className="w-8 h-8 rounded-lg" />
                </div>
                <button
                    onClick={() => useAppStore.setState({ sidebarCollapsed: false })}
                    className="w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg mb-2"
                >
                    <KeyRound className="w-5 h-5 text-dark-400" />
                </button>
                <button
                    onClick={() => {
                        useAppStore.setState({ sidebarCollapsed: false })
                        setShowInvitesModal(true)
                    }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg relative"
                >
                    <Mail className="w-5 h-5 text-dark-400" />
                    {pendingInvitesCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border border-dark-900" />
                    )}
                </button>
            </div>
        )
    }

    return (
        <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b border-dark-800 bg-dark-900">
                <img src={pkpLogo} alt="PassKeyPer" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-lg tracking-tight text-white">PassKeyPer</span>
            </div>

            <div className="p-4 border-b border-dark-800">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        Vaults
                    </h2>
                    <button
                        onClick={handleCreateVault}
                        className="w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded-lg transition-colors"
                        title="Create vault"
                    >
                        <FolderPlus className="w-4 h-4 text-dark-400" />
                    </button>
                </div>

                {/* Current Vault Selector */}
                {currentVault && (
                    <button
                        onClick={() => setShowVaultMenu(!showVaultMenu)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Vault className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium text-white truncate">
                                {currentVault.name}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-dark-400" />
                    </button>
                )}
            </div>

            {/* Vault List (when dropdown open) */}
            {showVaultMenu && (
                <div className="border-b border-dark-800 bg-dark-850 p-2">
                    {vaults.map((vault) => (
                        <button
                            key={vault.id}
                            onClick={() => {
                                setCurrentVault(vault)
                                setCurrentView('vaults')
                                setShowVaultMenu(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${vault.id === currentVault?.id
                                ? 'bg-primary-600/20 text-primary-400'
                                : 'hover:bg-dark-800 text-gray-300'
                                }`}
                        >
                            <Vault className="w-4 h-4" />
                            <span className="text-sm truncate">{vault.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 overflow-auto p-4 space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-2">
                    Team & Sharing
                </div>

                <button
                    onClick={() => setShowInvitesModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-300 group"
                >
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-dark-400 group-hover:text-primary-400" />
                        <span className="text-sm font-medium">Invitations</span>
                    </div>
                    {pendingInvitesCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary-600 text-[10px] font-bold text-white rounded-full">
                            {pendingInvitesCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setCurrentView('teams')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${currentView === 'teams' ? 'bg-primary-600/20 text-primary-400' : 'hover:bg-dark-800 text-gray-300'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Users className={`w-4 h-4 ${currentView === 'teams' ? 'text-primary-400' : 'text-dark-400 group-hover:text-primary-400'}`} />
                        <span className="text-sm font-medium">Teams</span>
                    </div>
                </button>

                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
                    Quick Access
                </div>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-300 group">
                    <ShieldCheck className="w-4 h-4 text-dark-400 group-hover:text-green-400" />
                    <span className="text-sm font-medium">Security Audit</span>
                </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-800 space-y-2">
                {/* Import/Export Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={() => useAppStore.setState({ showImportModal: true })}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg transition-colors text-blue-400"
                        title="Import passwords"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Import</span>
                    </button>
                    <button
                        onClick={() => useAppStore.setState({ showExportModal: true })}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg transition-colors text-purple-400"
                        title="Export passwords"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                </div>

                <button
                    onClick={handleLockVault}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-yellow-500"
                >
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Lock Vault</span>
                </button>
                <button
                    onClick={() => {
                        const event = new KeyboardEvent('keydown', {
                            key: ',',
                            ctrlKey: true,
                        })
                        window.dispatchEvent(event)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-400"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span className="text-sm font-medium">Settings</span>
                </button>
            </div>

            <InvitesModal
                isOpen={showInvitesModal}
                onClose={() => setShowInvitesModal(false)}
                onRefresh={handleRefreshVaults}
            />
        </div>
    )
}
