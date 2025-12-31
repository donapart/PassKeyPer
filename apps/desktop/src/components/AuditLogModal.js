import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Activity, Clock, Search, Filter } from 'lucide-react';
export function AuditLogModal({ isOpen, onClose, vaultId, vaultName }) {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen, vaultId]);
    const loadLogs = async () => {
        setIsLoading(true);
        try {
            // In a real app, this would call window.electronAPI.getAuditLogs(vaultId)
            // For now, we mock data
            setTimeout(() => {
                setLogs([
                    {
                        id: '1',
                        action: 'VAULT_OPENED',
                        resourceType: 'VAULT',
                        details: 'User unlocked the vault',
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        action: 'ITEM_CREATED',
                        resourceType: 'ITEM',
                        details: 'Created item "Github"',
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                        id: '3',
                        action: 'SHARE_INVITE_CREATED',
                        resourceType: 'VAULT',
                        details: 'Invited team@example.com with "read" permission',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    }
                ]);
                setIsLoading(false);
            }, 500);
        }
        catch (error) {
            console.error('Failed to load logs', error);
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    const filteredLogs = logs.filter(log => log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.details.toLowerCase().includes(filter.toLowerCase()));
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Activity, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Activity Log" }), _jsx("p", { className: "text-sm text-dark-400", children: vaultName || 'Account Activity' })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsxs("div", { className: "p-4 border-b border-dark-700 flex gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" }), _jsx("input", { type: "text", value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "Filter logs...", className: "input pl-10 w-full py-2 text-sm" })] }), _jsxs("button", { className: "btn-secondary py-2 flex items-center gap-2 text-sm", children: [_jsx(Filter, { className: "w-4 h-4" }), "Type"] })] }), _jsx("div", { className: "flex-1 overflow-auto", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center h-48", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" }) })) : filteredLogs.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Activity, { className: "w-12 h-12 text-dark-600 mx-auto mb-3" }), _jsx("p", { className: "text-dark-400", children: "No activity found" })] })) : (_jsx("div", { className: "divide-y divide-dark-700", children: filteredLogs.map((log) => (_jsx("div", { className: "p-4 hover:bg-dark-700/50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded", children: log.action.replace(/_/g, ' ') }), _jsx("span", { className: "text-dark-500", children: "\u2022" }), _jsxs("span", { className: "text-xs text-dark-400 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), new Date(log.createdAt).toLocaleString()] })] }), _jsx("p", { className: "text-sm text-gray-300", children: log.details })] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("span", { className: "text-[10px] text-dark-500 uppercase tracking-tighter", children: "Resource" }), _jsx("span", { className: "text-xs text-dark-400", children: log.resourceType })] })] }) }, log.id))) })) }), _jsx("div", { className: "p-6 border-t border-dark-700 flex justify-end", children: _jsx("button", { onClick: onClose, className: "btn-primary", children: "Done" }) })] }) }));
}
//# sourceMappingURL=AuditLogModal.js.map