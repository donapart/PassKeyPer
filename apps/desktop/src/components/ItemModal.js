import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Key, Shuffle, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from './Toast';
export function ItemModal({ isOpen, onClose, vaultId, editItem, onSave }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [showGenerator, setShowGenerator] = useState(false);
    useEffect(() => {
        if (editItem) {
            // Load existing item data
            setName(editItem.name || '');
            setUsername(editItem.username || '');
            setPassword(editItem.password || '');
            setUrl(editItem.urls?.[0] || '');
            setNotes(editItem.notes || '');
        }
        else {
            // Reset for new item
            setName('');
            setUsername('');
            setPassword('');
            setUrl('');
            setNotes('');
        }
    }, [editItem, isOpen]);
    const handleGeneratePassword = async () => {
        const generated = await window.electronAPI.generatePassword({
            length: 20,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeAmbiguous: true,
        });
        setPassword(generated);
    };
    const handleCopy = (field, value) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    const handleSave = async () => {
        if (!name.trim() || !password.trim()) {
            toast.warning('Name and password are required!');
            return;
        }
        setIsSaving(true);
        try {
            const itemData = {
                type: 'login',
                name: name.trim(),
                username: username.trim(),
                password: password,
                urls: url.trim() ? [url.trim()] : [],
                notes: notes.trim(),
                customFields: [],
                passwordHistory: [],
            };
            if (editItem) {
                await window.electronAPI.updateItem(editItem.id, itemData);
                toast.success('Item updated successfully');
            }
            else {
                await window.electronAPI.createItem(vaultId, itemData);
                toast.success('Item created successfully');
            }
            onSave();
            onClose();
        }
        catch (error) {
            toast.error('Failed to save item: ' + error.message);
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Key, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: editItem ? 'Edit Login' : 'New Login' }), _jsx("p", { className: "text-sm text-dark-400", children: "Securely store your credentials" })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Name *" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., GitHub Account", className: "input w-full", autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Website URL" }), _jsx("input", { type: "url", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://example.com", className: "input w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Username / Email" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "user@example.com", className: "input w-full pr-10" }), username && (_jsx("button", { onClick: () => handleCopy('username', username), className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-700 rounded transition-colors", children: copiedField === 'username' ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4 text-dark-400" })) }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Password *" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter password", className: "input w-full pr-20" }), _jsxs("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 flex gap-1", children: [_jsx("button", { onClick: () => setShowPassword(!showPassword), className: "p-2 hover:bg-dark-700 rounded transition-colors", children: showPassword ? (_jsx(EyeOff, { className: "w-4 h-4 text-dark-400" })) : (_jsx(Eye, { className: "w-4 h-4 text-dark-400" })) }), password && (_jsx("button", { onClick: () => handleCopy('password', password), className: "p-2 hover:bg-dark-700 rounded transition-colors", children: copiedField === 'password' ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4 text-dark-400" })) }))] })] }), _jsxs("button", { onClick: handleGeneratePassword, className: "btn-secondary flex items-center gap-2 whitespace-nowrap", children: [_jsx(Shuffle, { className: "w-4 h-4" }), "Generate"] })] }), password && _jsx(PasswordStrengthBar, { password: password })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Notes" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Add any additional notes...", className: "input w-full min-h-[100px] resize-none" })] })] }), _jsxs("div", { className: "p-6 border-t border-dark-700 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-ghost", children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: isSaving || !name.trim() || !password.trim(), className: "btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: isSaving ? 'Saving...' : editItem ? 'Update' : 'Create' })] })] }) }));
}
// Password strength indicator
function PasswordStrengthBar({ password }) {
    const [strength, setStrength] = useState(null);
    useEffect(() => {
        if (password) {
            window.electronAPI.calculateStrength(password).then(setStrength);
        }
    }, [password]);
    if (!strength)
        return null;
    const getColor = (score) => {
        if (score < 30)
            return 'bg-red-500';
        if (score < 60)
            return 'bg-yellow-500';
        if (score < 80)
            return 'bg-blue-500';
        return 'bg-green-500';
    };
    const getLabel = (score) => {
        if (score < 30)
            return 'Weak';
        if (score < 60)
            return 'Fair';
        if (score < 80)
            return 'Good';
        return 'Strong';
    };
    return (_jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-dark-400", children: ["Strength: ", getLabel(strength.score)] }), _jsxs("span", { className: "text-dark-400", children: [strength.entropy, " bits entropy"] })] }), _jsx("div", { className: "h-1 bg-dark-700 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all ${getColor(strength.score)}`, style: { width: `${strength.score}%` } }) }), strength.warnings.length > 0 && (_jsx("p", { className: "text-xs text-yellow-500", children: strength.warnings[0] }))] }));
}
//# sourceMappingURL=ItemModal.js.map