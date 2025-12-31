import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Mail, Check, Trash2, Shield, Calendar } from 'lucide-react';
import { toast } from './Toast';
export function InvitesModal({ isOpen, onClose, onRefresh }) {
    const [invites, setInvites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (isOpen) {
            loadInvites();
        }
    }, [isOpen]);
    const loadInvites = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            const result = await window.electronAPI.listInvites('received', token);
            setInvites(result);
        }
        catch (error) {
            console.error('Failed to load invites', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAccept = async (token) => {
        try {
            const authToken = localStorage.getItem('auth_token') || '';
            await window.electronAPI.acceptInvite(token, authToken);
            toast.success('Invitation accepted!');
            setInvites(invites.filter(i => i.token !== token));
            if (onRefresh)
                onRefresh();
        }
        catch (error) {
            toast.error(error.message || 'Failed to accept invitation');
        }
    };
    const handleDecline = async (id) => {
        // Implement decline logic
        setInvites(invites.filter(i => i.id !== id));
        toast.info('Invitation declined');
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg animate-slideUp overflow-hidden flex flex-col max-h-[80vh]", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Mail, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Pending Invitations" }), _jsx("p", { className: "text-sm text-dark-400", children: "Manage vault sharing invites" })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center h-32", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" }) })) : invites.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Mail, { className: "w-16 h-16 text-dark-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-300", children: "No pending invites" }), _jsx("p", { className: "text-dark-400", children: "When someone shares a vault with you, it will appear here" })] })) : (_jsx("div", { className: "space-y-4", children: invites.map((invite) => (_jsxs("div", { className: "p-4 bg-dark-900/50 border border-dark-700 rounded-xl space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center", children: _jsx(Shield, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-white", children: ["Share for ", _jsx("span", { className: "text-primary-400", children: invite.vault.name })] }), _jsxs("p", { className: "text-xs text-dark-400", children: ["From: ", invite.inviter.email] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-dark-500 block mb-1", children: "Permission" }), _jsx("span", { className: "text-xs font-medium text-gray-300 bg-dark-700 px-2 py-1 rounded", children: invite.permission })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-dark-400", children: [_jsx(Calendar, { className: "w-3 h-3" }), "Expires: ", new Date(invite.expiresAt).toLocaleDateString()] }), _jsxs("div", { className: "flex gap-2 pt-2 border-t border-dark-700", children: [_jsxs("button", { onClick: () => handleAccept(invite.token), className: "btn-primary py-2 flex-1 flex items-center justify-center gap-2 text-sm", children: [_jsx(Check, { className: "w-4 h-4" }), "Accept"] }), _jsxs("button", { onClick: () => handleDecline(invite.id), className: "btn-secondary py-2 flex-1 flex items-center justify-center gap-2 text-sm text-red-400 border-red-900/20", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Decline"] })] })] }, invite.id))) })) }), _jsx("div", { className: "p-6 border-t border-dark-700 flex justify-end", children: _jsx("button", { onClick: onClose, className: "btn-ghost", children: "Close" }) })] }) }));
}
//# sourceMappingURL=InvitesModal.js.map