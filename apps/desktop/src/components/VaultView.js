import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Plus, Search, Star, Folder, Key, CreditCard, FileText, Share2, Activity } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ItemModal } from './ItemModal';
import { ItemDetailModal } from './ItemDetailModal';
import { ShareVaultModal } from './ShareVaultModal';
import { AuditLogModal } from './AuditLogModal';
import { SecurityAuditModal } from './SecurityAuditModal';
import { ShieldAlert } from 'lucide-react';
export function VaultView() {
    const { currentVault, items, setItems, searchQuery, setSearchQuery } = useAppStore();
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showAuditLogModal, setShowAuditLogModal] = useState(false);
    const [showSecurityAuditModal, setShowSecurityAuditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    useEffect(() => {
        if (currentVault) {
            loadItems();
        }
    }, [currentVault]);
    const loadItems = async () => {
        if (!currentVault)
            return;
        const items = await window.electronAPI.listItems(currentVault.id);
        setItems(items);
    };
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!currentVault)
            return;
        if (query.trim()) {
            const results = await window.electronAPI.searchItems(currentVault.id, query);
            setItems(results);
        }
        else {
            loadItems();
        }
    };
    const handleItemClick = (item) => {
        setSelectedItemId(item.id);
        setShowDetailModal(true);
    };
    const handleEdit = async () => {
        if (!selectedItemId)
            return;
        const item = await window.electronAPI.getItem(selectedItemId);
        setEditingItem(item);
        setShowDetailModal(false);
        setShowCreateModal(true);
    };
    const handleSave = () => {
        loadItems();
        setEditingItem(null);
    };
    const handleCloseCreate = () => {
        setShowCreateModal(false);
        setEditingItem(null);
    };
    const handleDelete = () => {
        loadItems();
        setSelectedItemId(null);
    };
    const getItemIcon = (type) => {
        switch (type) {
            case 'login':
                return _jsx(Key, { className: "w-5 h-5" });
            case 'card':
                return _jsx(CreditCard, { className: "w-5 h-5" });
            case 'note':
                return _jsx(FileText, { className: "w-5 h-5" });
            default:
                return _jsx(Folder, { className: "w-5 h-5" });
        }
    };
    if (!currentVault) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Folder, { className: "w-16 h-16 text-dark-600 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-semibold text-gray-300 mb-2", children: "No vault selected" }), _jsx("p", { className: "text-dark-400", children: "Select or create a vault from the sidebar to get started" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-dark-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: currentVault.name }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setShowSecurityAuditModal(true), className: "w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-red-400 transition-colors border border-dark-700", title: "Security Audit", children: _jsx(ShieldAlert, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => setShowAuditLogModal(true), className: "w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400 transition-colors border border-dark-700", title: "Activity Log", children: _jsx(Activity, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => setShowShareModal(true), className: "w-10 h-10 flex items-center justify-center hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400 transition-colors border border-dark-700", title: "Share Vault", children: _jsx(Share2, { className: "w-5 h-5" }) }), _jsxs("button", { onClick: () => setShowCreateModal(true), className: "btn-primary flex items-center gap-2 ml-2", children: [_jsx(Plus, { className: "w-5 h-5" }), "New Item"] })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => handleSearch(e.target.value), placeholder: "Search vault...", className: "input pl-11 w-full" })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: items.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Key, { className: "w-16 h-16 text-dark-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-300 mb-2", children: searchQuery ? 'No items found' : 'No items yet' }), _jsx("p", { className: "text-dark-400 mb-4", children: searchQuery
                                        ? 'Try a different search term'
                                        : 'Create your first password or secure note' }), !searchQuery && (_jsxs("button", { onClick: () => setShowCreateModal(true), className: "btn-primary", children: [_jsx(Plus, { className: "w-5 h-5 inline mr-2" }), "Add Item"] }))] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: items.map((item) => (_jsx("button", { onClick: () => handleItemClick(item), className: "card hover:border-primary-600 transition-all text-left group", children: _jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20", children: getItemIcon(item.type) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white group-hover:text-primary-400", children: item.metadata.name }), _jsx("p", { className: "text-xs text-dark-400 capitalize", children: item.type })] })] }), item.metadata.favorite && (_jsx(Star, { className: "w-4 h-4 text-yellow-500 fill-yellow-500" }))] }) }, item.id))) })) })] }), _jsx(ItemModal, { isOpen: showCreateModal, onClose: handleCloseCreate, vaultId: currentVault.id, editItem: editingItem, onSave: handleSave }), selectedItemId && (_jsx(ItemDetailModal, { isOpen: showDetailModal, onClose: () => setShowDetailModal(false), itemId: selectedItemId, onEdit: handleEdit, onDelete: handleDelete })), _jsx(ShareVaultModal, { isOpen: showShareModal, onClose: () => setShowShareModal(false), vaultId: currentVault.id, vaultName: currentVault.name }), _jsx(AuditLogModal, { isOpen: showAuditLogModal, onClose: () => setShowAuditLogModal(false), vaultId: currentVault.id, vaultName: currentVault.name }), _jsx(SecurityAuditModal, { isOpen: showSecurityAuditModal, onClose: () => setShowSecurityAuditModal(false) })] }));
}
//# sourceMappingURL=VaultView.js.map