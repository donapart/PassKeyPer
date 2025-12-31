import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Users, Trash2, Send } from 'lucide-react';
import { toast } from './Toast';
export function ShareVaultModal({ isOpen, onClose, vaultId, vaultName }) {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [isLoading, setIsLoading] = useState(false);
    // Mock data for currently shared users - in real app, fetch from API
    const [shares, setShares] = useState([
        { id: '1', email: 'owner@example.com', permission: 'owner' },
    ]);
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return;
        setIsLoading(true);
        try {
            // In a real app, this would call the API
            // For now, we mock the success
            // Invitation will be handled by API call
            // Simulating API call
            // await window.electronAPI.inviteToVault(vaultId, email, permission)
            toast.success(`Invite sent to ${email}`);
            setEmail('');
        }
        catch (error) {
            toast.error(error.message || 'Failed to send invite');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Users, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Share Vault" }), _jsx("p", { className: "text-sm text-dark-400", children: vaultName })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("form", { onSubmit: handleInvite, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Invite by Email" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "user@example.com", className: "input flex-1", required: true }), _jsxs("select", { className: "input w-32", value: permission, onChange: (e) => setPermission(e.target.value), children: [_jsx("option", { value: "read", children: "Read" }), _jsx("option", { value: "write", children: "Write" }), _jsx("option", { value: "admin", children: "Admin" })] })] })] }), _jsxs("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full flex items-center justify-center gap-2", children: [_jsx(Send, { className: "w-4 h-4" }), isLoading ? 'Sending...' : 'Send Invitation'] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium text-gray-400 uppercase tracking-wider", children: "Who has access" }), _jsx("div", { className: "space-y-2", children: shares.map((share) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-dark-900/50 rounded-lg border border-dark-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-300", children: share.email[0].toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: share.email }), _jsx("p", { className: "text-xs text-dark-400 capitalize", children: share.permission })] })] }), share.permission !== 'owner' && (_jsx("button", { className: "text-dark-400 hover:text-red-400 p-1", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }, share.id))) })] })] }), _jsx("div", { className: "p-6 border-t border-dark-700 flex justify-end", children: _jsx("button", { onClick: onClose, className: "btn-ghost", children: "Close" }) })] }) }));
}
//# sourceMappingURL=ShareVaultModal.js.map