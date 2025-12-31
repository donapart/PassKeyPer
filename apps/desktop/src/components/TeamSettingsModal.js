import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Settings, Trash2, AlertTriangle, Save } from 'lucide-react';
import { toast } from './Toast';
export function TeamSettingsModal({ isOpen, onClose, team, onSuccess }) {
    const [name, setName] = useState(team?.name || '');
    const [description, setDescription] = useState(team?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            await window.electronAPI.updateTeam(team.id, { name, description }, token);
            toast.success('Team settings updated');
            onSuccess?.();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to update team');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteTeam = async () => {
        if (deleteConfirmText !== team.name) {
            toast.error('Team name does not match');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            await window.electronAPI.deleteTeam(team.id, token);
            toast.success(`Team "${team.name}" has been deleted`);
            onSuccess?.();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete team');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: [_jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg animate-slideUp overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-dark-700 to-dark-800 p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center border border-dark-600", children: _jsx(Settings, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Team Settings" }), _jsx("p", { className: "text-dark-400 text-xs", children: "Manage workspace properties" })] })] }), _jsx("button", { onClick: onClose, className: "text-dark-400 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-8", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest", children: "Team Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "input w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-dark-400 mb-2 font-mono uppercase tracking-widest", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), className: "input w-full min-h-[80px] py-3", placeholder: "Describe what this team is for..." })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", className: "btn-primary flex items-center gap-2", disabled: isSubmitting, children: [_jsx(Save, { className: "w-4 h-4" }), "Save Changes"] }) })] }), _jsxs("div", { className: "pt-6 border-t border-dark-700/50", children: [_jsxs("h3", { className: "text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Danger Zone"] }), _jsxs("div", { className: "bg-red-900/10 border border-red-900/30 rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: "Delete Team" }), _jsx("p", { className: "text-xs text-dark-400 mt-1", children: "Once deleted, all team vaults and data are permanently gone." })] }), _jsx("button", { onClick: () => setShowDeleteConfirm(true), className: "px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-all text-sm font-bold", children: "Delete Team" })] })] })] })] }), showDeleteConfirm && (_jsx("div", { className: "absolute inset-0 bg-dark-900/90 backdrop-blur-md flex items-center justify-center z-[60] p-4", children: _jsxs("div", { className: "bg-dark-800 border border-red-900/30 rounded-xl w-full max-w-md p-6 shadow-2xl", children: [_jsx("div", { className: "w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-500" }) }), _jsx("h2", { className: "text-xl font-bold text-white text-center mb-2", children: "Are you absolutely sure?" }), _jsxs("p", { className: "text-dark-400 text-center text-sm mb-6 leading-relaxed", children: ["This action cannot be undone. This will permanently delete the", _jsxs("span", { className: "text-white font-bold", children: [" ", team.name, " "] }), "team and all associated vaults."] }), _jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "block text-[10px] font-bold text-dark-400 mb-2 font-mono uppercase text-center", children: ["Type ", _jsx("span", { className: "text-red-400", children: team.name }), " to confirm"] }), _jsx("input", { type: "text", value: deleteConfirmText, onChange: (e) => setDeleteConfirmText(e.target.value), className: "input w-full text-center border-red-900/30 focus:border-red-500", autoFocus: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 font-mono", children: [_jsx("button", { onClick: () => setShowDeleteConfirm(false), className: "btn-ghost", children: "Cancel" }), _jsxs("button", { onClick: handleDeleteTeam, disabled: deleteConfirmText !== team.name || isSubmitting, className: "bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete"] })] })] }) }))] }));
}
//# sourceMappingURL=TeamSettingsModal.js.map