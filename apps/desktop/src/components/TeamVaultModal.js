import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Shield, Lock, Plus } from 'lucide-react';
import { toast } from './Toast';
export function TeamVaultModal({ isOpen, onClose, teamId, teamName, onSuccess }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('work');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            // To be truly zero-knowledge, we should generate a key here.
            // For this version, we let the backend handle the initial key record
            // but in production, the client generates the 256-bit vault key.
            await window.electronAPI.createCloudVault({
                name,
                type,
                teamId,
                encryptedKey: 'INITIAL_REPLACE_ME' // Placeholder for now
            }, token);
            toast.success(`Vault "${name}" created in ${teamName}`);
            setName('');
            onSuccess?.();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to create vault');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-primary-600/10 to-blue-600/10 p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Shield, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "New Team Vault" }), _jsxs("p", { className: "text-dark-400 text-xs", children: ["Creating in ", teamName] })] })] }), _jsx("button", { onClick: onClose, className: "text-dark-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest", children: "Vault Name" }), _jsx("input", { autoFocus: true, type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Marketing Credentials", className: "input w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest", children: "Vault Type" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setType('work'), className: `p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${type === 'work'
                                                ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                                                : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'}`, children: [_jsx(Lock, { className: "w-4 h-4" }), _jsx("span", { className: "font-bold", children: "Work" })] }), _jsxs("button", { type: "button", onClick: () => setType('shared'), className: `p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${type === 'shared'
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'}`, children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { className: "font-bold", children: "Shared" })] })] })] }), _jsx("div", { className: "bg-dark-900/50 p-4 rounded-lg border border-dark-700/50", children: _jsxs("p", { className: "text-[11px] text-dark-400 leading-relaxed text-center italic", children: ["All members of ", _jsx("span", { className: "text-primary-400 font-bold", children: teamName }), " will immediately have access to this vault based on their team role."] }) }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary px-8", disabled: isSubmitting, children: isSubmitting ? 'Creating...' : 'Create Vault' })] })] })] }) }));
}
//# sourceMappingURL=TeamVaultModal.js.map