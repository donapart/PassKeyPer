import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useAppStore } from '../store/app-store';
export function SyncStatusBar({ sync, isConnected, isSyncing, lastSync, errors, itemsUpdated, itemsConflicted }) {
    const { currentVault } = useAppStore();
    const formatLastSync = (date) => {
        if (!date)
            return 'Never';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (seconds < 60)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        return date.toLocaleDateString();
    };
    if (!currentVault)
        return null;
    return (_jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-dark-850 border-t border-dark-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [isConnected ? (_jsx(Cloud, { className: "w-4 h-4 text-emerald-400" })) : (_jsx(CloudOff, { className: "w-4 h-4 text-gray-500" })), _jsx("span", { className: "text-xs text-gray-400", children: isConnected ? 'Connected' : 'Offline' })] }), isSyncing && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4 text-blue-400 animate-spin" }), _jsx("span", { className: "text-xs text-blue-400", children: "Syncing..." })] })), !isSyncing && lastSync && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 text-emerald-400" }), _jsxs("span", { className: "text-xs text-gray-400", children: ["Last sync: ", formatLastSync(lastSync)] })] })), itemsConflicted > 0 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-yellow-400" }), _jsxs("span", { className: "text-xs text-yellow-400", children: [itemsConflicted, " conflicts"] })] })), errors.length > 0 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { className: "text-xs text-red-400", children: "Sync error" })] })), _jsx("div", { className: "flex-1" }), _jsxs("button", { onClick: () => sync(), disabled: !isConnected || isSyncing, className: "flex items-center gap-1 px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:text-gray-600 rounded transition-colors", title: "Sync now", children: [_jsx(RefreshCw, { className: `w-3 h-3 ${isSyncing ? 'animate-spin' : ''}` }), "Sync"] })] }));
}
//# sourceMappingURL=SyncStatusBar.js.map