import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X, Copy, Check, Eye, EyeOff, Star, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { TOTPDisplay } from './TOTPDisplay';
export function ItemDetailModal({ isOpen, onClose, itemId, onEdit, onDelete }) {
    const [item, setItem] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (isOpen && itemId) {
            loadItem();
        }
    }, [isOpen, itemId]);
    const loadItem = async () => {
        setIsLoading(true);
        try {
            const data = await window.electronAPI.getItem(itemId);
            setItem(data);
        }
        catch (error) {
            console.error('Failed to load item:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCopy = (field, value) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    const handleToggleFavorite = async () => {
        await window.electronAPI.toggleFavorite(itemId);
        loadItem();
    };
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item? This cannot be undone.')) {
            await window.electronAPI.deleteItem(itemId);
            onDelete();
            onClose();
        }
    };
    const handleOpenUrl = (url) => {
        // In Electron, you'd use shell.openExternal
        window.open(url, '_blank');
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: item?.name || 'Loading...' }), _jsx("button", { onClick: handleToggleFavorite, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(Star, { className: `w-5 h-5 ${item?.metadata?.favorite
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-dark-400'}` }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: onEdit, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", title: "Edit", children: _jsx(Edit2, { className: "w-4 h-4 text-dark-400" }) }), _jsx("button", { onClick: handleDelete, className: "w-8 h-8 flex items-center justify-center hover:bg-red-600/20 rounded-lg transition-colors", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4 text-red-500" }) }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] })] }), isLoading ? (_jsx("div", { className: "flex-1 flex items-center justify-center p-12", children: _jsx("div", { className: "animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" }) })) : item ? (_jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [item.urls && item.urls.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Website" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm", children: item.urls[0] }), _jsxs("button", { onClick: () => handleOpenUrl(item.urls[0]), className: "btn-secondary flex items-center gap-2", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), "Open"] })] })] })), item.username && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Username" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm", children: item.username }), _jsx("button", { onClick: () => handleCopy('username', item.username), className: "btn-secondary flex items-center gap-2", children: copiedField === 'username' ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4 text-green-500" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy"] })) })] })] })), item.password && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Password" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm", children: showPassword ? item.password : '••••••••••••' }), _jsx("button", { onClick: () => setShowPassword(!showPassword), className: "btn-secondary", children: showPassword ? (_jsx(EyeOff, { className: "w-4 h-4" })) : (_jsx(Eye, { className: "w-4 h-4" })) }), _jsx("button", { onClick: () => handleCopy('password', item.password), className: "btn-secondary flex items-center gap-2", children: copiedField === 'password' ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4 text-green-500" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy"] })) })] })] })), item.customFields?.find((f) => f.name.toLowerCase().includes('totp') ||
                            f.name.toLowerCase().includes('2fa') ||
                            f.name.toLowerCase().includes('secret')) && (() => {
                            const totpField = item.customFields.find((f) => f.name.toLowerCase().includes('totp') ||
                                f.name.toLowerCase().includes('2fa') ||
                                f.name.toLowerCase().includes('secret'));
                            return (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Two-Factor Authentication (TOTP)" }), _jsx(TOTPDisplay, { secret: totpField.value })] }));
                        })(), item.notes && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Notes" }), _jsx("div", { className: "px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-gray-300 text-sm whitespace-pre-wrap", children: item.notes })] })), _jsx("div", { className: "pt-6 border-t border-dark-700", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-dark-400", children: "Created:" }), _jsx("span", { className: "text-gray-300 ml-2", children: new Date(item.createdAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-dark-400", children: "Modified:" }), _jsx("span", { className: "text-gray-300 ml-2", children: new Date(item.updatedAt).toLocaleDateString() })] }), item.lastUsedAt && (_jsxs("div", { children: [_jsx("span", { className: "text-dark-400", children: "Last used:" }), _jsx("span", { className: "text-gray-300 ml-2", children: new Date(item.lastUsedAt).toLocaleDateString() })] }))] }) })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center p-12", children: _jsx("p", { className: "text-dark-400", children: "Item not found" }) }))] }) }));
}
//# sourceMappingURL=ItemDetailModal.js.map