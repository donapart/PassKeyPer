import React, { useEffect, useState } from 'react'
import { Plus, Search, Star, Folder, Key, CreditCard, FileText, Share2, Activity } from 'lucide-react'
import { useAppStore } from '../store/app-store'
import { ItemModal } from './ItemModal'
import { ItemDetailModal } from './ItemDetailModal'
import { ShareVaultModal } from './ShareVaultModal'
import { AuditLogModal } from './AuditLogModal'
import { SecurityAuditModal } from './SecurityAuditModal'
import { ShieldAlert } from 'lucide-react'

export function VaultView() {
    const { currentVault, items, setItems, searchQuery, setSearchQuery } = useAppStore()
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showAuditLogModal, setShowAuditLogModal] = useState(false)
    const [showSecurityAuditModal, setShowSecurityAuditModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    useEffect(() => {
        if (currentVault) {
            loadItems()
        }
    }, [currentVault])

    const loadItems = async () => {
        if (!currentVault) return
        const items = await window.electronAPI.listItems(currentVault.id)
        setItems(items)
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (!currentVault) return

        if (query.trim()) {
            const results = await window.electronAPI.searchItems(currentVault.id, query)
            setItems(results)
        } else {
            loadItems()
        }
    }

    const handleItemClick = (item: any) => {
        setSelectedItemId(item.id)
        setShowDetailModal(true)
    }

    const handleEdit = async () => {
        if (!selectedItemId) return
        const item = await window.electronAPI.getItem(selectedItemId)
        setEditingItem(item)
        setShowDetailModal(false)
        setShowCreateModal(true)
    }

    const handleSave = () => {
        loadItems()
        setEditingItem(null)
    }

    const handleCloseCreate = () => {
        setShowCreateModal(false)
        setEditingItem(null)
    }

    const handleDelete = () => {
        loadItems()
        setSelectedItemId(null)
    }

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'login':
                return <Key className="w-5 h-5" />
            case 'card':
                return <CreditCard className="w-5 h-5" />
            case 'note':
                return <FileText className="w-5 h-5" />
            default:
                return <Folder className="w-5 h-5" />
        }
    }

    if (!currentVault) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Folder className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-300 mb-2">No vault selected</h2>
                    <p className="text-dark-400">Select or create a vault from the sidebar to get started</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-dark-800">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white">{currentVault.name}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSecurityAuditModal(true)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-red-400 transition-colors border border-dark-700"
                                title="Security Audit"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowAuditLogModal(true)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400 transition-colors border border-dark-700"
                                title="Activity Log"
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400 transition-colors border border-dark-700"
                                title="Share Vault"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary flex items-center gap-2 ml-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Item
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search vault..."
                            className="input pl-11 w-full"
                        />
                    </div>
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-auto p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Key className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                                {searchQuery ? 'No items found' : 'No items yet'}
                            </h3>
                            <p className="text-dark-400 mb-4">
                                {searchQuery
                                    ? 'Try a different search term'
                                    : 'Create your first password or secure note'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-primary"
                                >
                                    <Plus className="w-5 h-5 inline mr-2" />
                                    Add Item
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="card hover:border-primary-600 transition-all text-left group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20">
                                                {getItemIcon(item.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white group-hover:text-primary-400">
                                                    {item.metadata.name}
                                                </h3>
                                                <p className="text-xs text-dark-400 capitalize">{item.type}</p>
                                            </div>
                                        </div>
                                        {item.metadata.favorite && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ItemModal
                isOpen={showCreateModal}
                onClose={handleCloseCreate}
                vaultId={currentVault.id}
                editItem={editingItem}
                onSave={handleSave}
            />

            {selectedItemId && (
                <ItemDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    itemId={selectedItemId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <ShareVaultModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                vaultId={currentVault.id}
                vaultName={currentVault.name}
            />

            <AuditLogModal
                isOpen={showAuditLogModal}
                onClose={() => setShowAuditLogModal(false)}
                vaultId={currentVault.id}
                vaultName={currentVault.name}
            />

            <SecurityAuditModal
                isOpen={showSecurityAuditModal}
                onClose={() => setShowSecurityAuditModal(false)}
            />
        </>
    )
}
