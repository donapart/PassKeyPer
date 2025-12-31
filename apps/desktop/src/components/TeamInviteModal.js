import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Mail, Shield, UserPlus } from 'lucide-react';
import { toast } from './Toast';
export function TeamInviteModal({ isOpen, onClose, teamId, teamName, onSuccess }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            await window.electronAPI.addTeamMember(teamId, email, role, token);
            toast.success(`Invitation sent to ${email}`);
            setEmail('');
            onSuccess?.();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to add member');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(UserPlus, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Add Team Member" }), _jsx("p", { className: "text-dark-400 text-sm", children: teamName })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2 font-mono uppercase tracking-tighter", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" }), _jsx("input", { autoFocus: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "colleague@example.com", className: "input pl-11 w-full", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2 font-mono uppercase tracking-tighter", children: "Role" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setRole('MEMBER'), className: `p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${role === 'MEMBER'
                                                ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                                                : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'}`, children: [_jsx("span", { className: "font-bold", children: "Member" }), _jsx("span", { className: "text-[10px] opacity-75", children: "Standard access" })] }), _jsxs("button", { type: "button", onClick: () => setRole('ADMIN'), className: `p-3 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${role === 'ADMIN'
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'}`, children: [_jsx(Shield, { className: "w-4 h-4" }), _jsx("span", { className: "font-bold", children: "Admin" }), _jsx("span", { className: "text-[10px] opacity-75", children: "Full management" })] })] })] }), _jsx("p", { className: "text-xs text-dark-500 bg-dark-900 p-3 rounded-lg", children: "Members will be able to access all vaults associated with this team once they accept the invitation." }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 font-mono", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary px-8", disabled: isSubmitting, children: isSubmitting ? 'Adding...' : 'Add Member' })] })] })] }) }));
}
//# sourceMappingURL=TeamInviteModal.js.map