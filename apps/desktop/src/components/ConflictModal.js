import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ConflictModal - Resolve sync conflicts
 */
import { useState } from 'react';
import { X, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';
export function ConflictModal({ isOpen, onClose, conflicts, onResolve }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [resolution, setResolution] = useState(null);
    const { toast } = useToast();
    if (!isOpen || conflicts.length === 0)
        return null;
    const currentConflict = conflicts[currentIndex];
    const hasMore = currentIndex < conflicts.length - 1;
    const handleResolve = async () => {
        if (!resolution) {
            toast({ type: 'error', message: 'Please select a resolution' });
            return;
        }
        try {
            await onResolve(currentConflict.itemId, resolution);
            if (hasMore) {
                setCurrentIndex(currentIndex + 1);
                setResolution(null);
            }
            else {
                toast({ type: 'success', message: 'All conflicts resolved!' });
                onClose();
            }
        }
        catch (error) {
            toast({ type: 'error', message: `Failed to resolve: ${error.message}` });
        }
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    const getDiff = (local, server) => {
        const diff = [];
        // Compare basic fields
        if (local.username !== server.username) {
            diff.push(`Username: "${local.username}" vs "${server.username}"`);
        }
        if (local.password !== server.password) {
            diff.push('Password: Different');
        }
        if (local.notes !== server.notes) {
            diff.push('Notes: Different');
        }
        return diff;
    };
    const differences = getDiff(currentConflict.localVersion.data, currentConflict.serverVersion.data);
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", style: { maxWidth: '800px' }, children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-yellow-500" }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: "Resolve Conflict" }), _jsxs("p", { className: "text-sm text-gray-400 mt-1", children: ["Conflict ", currentIndex + 1, " of ", conflicts.length] })] })] }), _jsx("button", { onClick: onClose, className: "modal-close", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-6 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg", children: [_jsx("h3", { className: "font-semibold mb-2", children: currentConflict.name }), _jsx("p", { className: "text-sm text-gray-400", children: "This item was modified on both this device and the server. Choose which version to keep." })] }), differences.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Changes:" }), _jsx("ul", { className: "space-y-1", children: differences.map((diff, i) => (_jsxs("li", { className: "text-sm text-gray-400", children: ["\u2022 ", diff] }, i))) })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: `p-4 border rounded-lg cursor-pointer transition-all ${resolution === 'local'
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-dark-700 hover:border-dark-600'}`, onClick: () => setResolution('local'), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-semibold text-blue-400", children: "Local Version" }), resolution === 'local' && (_jsx(Check, { className: "w-5 h-5 text-blue-400" }))] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Version:" }), ' ', _jsx("span", { className: "text-white", children: currentConflict.localVersion.version })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Modified:" }), ' ', _jsx("span", { className: "text-white", children: formatDate(currentConflict.localVersion.updatedAt) })] }), _jsxs("div", { className: "pt-2 border-t border-dark-700", children: [_jsx("div", { className: "text-gray-500 mb-1", children: "Username:" }), _jsx("div", { className: "text-white font-mono text-xs", children: currentConflict.localVersion.data.username || 'N/A' })] })] })] }), _jsxs("div", { className: `p-4 border rounded-lg cursor-pointer transition-all ${resolution === 'server'
                                        ? 'border-emerald-500 bg-emerald-900/20'
                                        : 'border-dark-700 hover:border-dark-600'}`, onClick: () => setResolution('server'), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-semibold text-emerald-400", children: "Server Version" }), resolution === 'server' && (_jsx(Check, { className: "w-5 h-5 text-emerald-400" }))] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Version:" }), ' ', _jsx("span", { className: "text-white", children: currentConflict.serverVersion.version })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Modified:" }), ' ', _jsx("span", { className: "text-white", children: formatDate(currentConflict.serverVersion.updatedAt) })] }), _jsxs("div", { className: "pt-2 border-t border-dark-700", children: [_jsx("div", { className: "text-gray-500 mb-1", children: "Username:" }), _jsx("div", { className: "text-white font-mono text-xs", children: currentConflict.serverVersion.data.username || 'N/A' })] })] })] })] }), _jsx("div", { className: "mb-6", children: _jsx("button", { onClick: () => setResolution('merge'), className: `w-full p-3 border rounded-lg text-left transition-all ${resolution === 'merge'
                                    ? 'border-purple-500 bg-purple-900/20'
                                    : 'border-dark-700 hover:border-dark-600'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-purple-400", children: "Merge Manually" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Review and edit the item yourself" })] }), resolution === 'merge' && (_jsx(Check, { className: "w-5 h-5 text-purple-400" }))] }) }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-secondary flex-1", children: "Cancel" }), _jsx("button", { onClick: handleResolve, disabled: !resolution, className: "btn-primary flex-1 flex items-center justify-center gap-2", children: hasMore ? (_jsxs(_Fragment, { children: ["Resolve & Next", _jsx(ArrowRight, { className: "w-4 h-4" })] })) : (_jsxs(_Fragment, { children: ["Resolve & Finish", _jsx(Check, { className: "w-4 h-4" })] })) })] })] })] }) }));
}
//# sourceMappingURL=ConflictModal.js.map