import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Lock, Keyboard, Bell, Shield, Database, Cloud } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { toast } from './Toast';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';
export function SettingsModal({ isOpen, onClose }) {
    const { syncSettings, setSyncSettings, setShowImportModal, setShowExportModal } = useAppStore();
    const [autoLockMinutes, setAutoLockMinutes] = useState(parseInt(localStorage.getItem('autoLockMinutes') || '15'));
    const [clipboardTimeout, setClipboardTimeout] = useState(parseInt(localStorage.getItem('clipboardTimeout') || '30'));
    const [showNotifications, setShowNotifications] = useState(localStorage.getItem('showNotifications') !== 'false');
    // Sync Settings (local state for form, init from store)
    const [syncApiUrl, setSyncApiUrl] = useState(syncSettings.apiUrl);
    const [autoSync, setAutoSync] = useState(syncSettings.autoSync);
    const [syncInterval, setSyncInterval] = useState(syncSettings.syncInterval);
    const { user, setUser } = useAppStore();
    const [show2FAModal, setShow2FAModal] = useState(false);
    const handleSave = () => {
        // Save settings to localStorage
        localStorage.setItem('autoLockMinutes', autoLockMinutes.toString());
        localStorage.setItem('clipboardTimeout', clipboardTimeout.toString());
        localStorage.setItem('showNotifications', showNotifications.toString());
        // Save Sync Settings to Store (handles localStorage internally)
        setSyncSettings({
            apiUrl: syncApiUrl,
            autoSync,
            syncInterval
        });
        toast.success('Settings saved successfully');
        onClose();
    };
    const handleExportVault = async () => {
        setShowExportModal(true);
        onClose();
    };
    const handleImportVault = async () => {
        setShowImportModal(true);
        onClose();
    };
    const handle2FASuccess = async () => {
        // Refresh user info to update 2FA status
        try {
            const token = localStorage.getItem('auth_token') || '';
            const result = await window.electronAPI.getMe(token);
            if (result.user) {
                setUser({
                    ...result.user,
                    salt: user?.salt || ''
                });
            }
        }
        catch (error) {
            console.error('Failed to refresh user info', error);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: [_jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center", children: _jsx(Shield, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Settings" }), _jsx("p", { className: "text-sm text-dark-400", children: "Configure PassKeyPer" })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5 text-dark-400" }) })] }), _jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [_jsxs("section", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Lock, { className: "w-5 h-5 text-primary-400" }), "Security"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Auto-lock after inactivity" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "5", max: "60", step: "5", value: autoLockMinutes, onChange: (e) => setAutoLockMinutes(parseInt(e.target.value)), className: "flex-1" }), _jsxs("span", { className: "text-primary-400 font-medium w-20 text-right", children: [autoLockMinutes, " min"] })] }), _jsx("p", { className: "text-xs text-dark-400 mt-1", children: "Automatically lock vault after this period of inactivity" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Clear clipboard after" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: "10", max: "120", step: "10", value: clipboardTimeout, onChange: (e) => setClipboardTimeout(parseInt(e.target.value)), className: "flex-1" }), _jsxs("span", { className: "text-primary-400 font-medium w-20 text-right", children: [clipboardTimeout, "s"] })] }), _jsx("p", { className: "text-xs text-dark-400 mt-1", children: "Automatically clear clipboard after copying password" })] }), _jsx("div", { className: "pt-4 border-t border-dark-700/50", children: _jsxs("div", { className: "flex items-center justify-between p-4 bg-dark-900/40 rounded-xl border border-dark-700/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${user?.twoFactorEnabled ? 'bg-green-600/20' : 'bg-amber-600/20'}`, children: _jsx(Smartphone, { className: `w-5 h-5 ${user?.twoFactorEnabled ? 'text-green-400' : 'text-amber-400'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-white", children: "Two-Factor Authentication" }), _jsx("p", { className: `text-[10px] font-bold uppercase tracking-wider ${user?.twoFactorEnabled ? 'text-green-500' : 'text-amber-500'}`, children: user?.twoFactorEnabled ? 'Enabled' : 'Disabled' })] })] }), _jsx("button", { onClick: () => setShow2FAModal(true), className: `px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${user?.twoFactorEnabled
                                                                ? 'bg-dark-700 hover:bg-dark-600 text-white'
                                                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20'}`, children: user?.twoFactorEnabled ? 'Manage' : 'Enable' })] }) })] })] }), _jsxs("section", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Bell, { className: "w-5 h-5 text-primary-400" }), "Notifications"] }), _jsx("div", { className: "space-y-3", children: _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: showNotifications, onChange: (e) => setShowNotifications(e.target.checked), className: "w-4 h-4" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-300", children: "Show notifications" }), _jsx("p", { className: "text-xs text-dark-400", children: "Display toast notifications for actions" })] })] }) })] }), _jsxs("section", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Keyboard, { className: "w-5 h-5 text-primary-400" }), "Keyboard Shortcuts"] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-dark-700", children: [_jsx("span", { className: "text-gray-300", children: "Search" }), _jsx("kbd", { className: "px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs", children: "Ctrl+F" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-dark-700", children: [_jsx("span", { className: "text-gray-300", children: "New Item" }), _jsx("kbd", { className: "px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs", children: "Ctrl+N" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-dark-700", children: [_jsx("span", { className: "text-gray-300", children: "Lock Vault" }), _jsx("kbd", { className: "px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs", children: "Ctrl+L" })] }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsx("span", { className: "text-gray-300", children: "Settings" }), _jsx("kbd", { className: "px-2 py-1 bg-dark-900 border border-dark-600 rounded text-xs", children: "Ctrl+," })] })] })] }), _jsxs("section", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Cloud, { className: "w-5 h-5 text-primary-400" }), "Cloud Sync"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Server URL" }), _jsx("input", { type: "text", value: syncApiUrl, onChange: (e) => setSyncApiUrl(e.target.value), className: "input w-full", placeholder: "http://localhost:3000" }), _jsx("p", { className: "text-xs text-dark-400 mt-1", children: "URL of the synchronization server (REST + WebSocket)" })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: autoSync, onChange: (e) => setAutoSync(e.target.checked), className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium text-gray-300", children: "Enable Auto-Sync" })] }) }), autoSync && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Sync Interval" }), _jsxs("select", { value: syncInterval, onChange: (e) => setSyncInterval(parseInt(e.target.value)), className: "input w-full", children: [_jsx("option", { value: 15000, children: "Every 15 seconds" }), _jsx("option", { value: 30000, children: "Every 30 seconds" }), _jsx("option", { value: 60000, children: "Every minute" }), _jsx("option", { value: 300000, children: "Every 5 minutes" }), _jsx("option", { value: 900000, children: "Every 15 minutes" })] })] }))] })] }), _jsxs("section", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Database, { className: "w-5 h-5 text-primary-400" }), "Data Management"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleExportVault, className: "btn-secondary flex-1", children: "Export Vault" }), _jsx("button", { onClick: handleImportVault, className: "btn-secondary flex-1", children: "Import Vault" })] }), _jsx("p", { className: "text-xs text-dark-400 mt-2", children: "Backup your vault or import from other password managers" })] }), _jsx("section", { className: "pt-6 border-t border-dark-700", children: _jsxs("div", { className: "text-sm text-dark-400 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { className: "text-gray-300", children: "PassKeyPer" }), " v0.1.0"] }), _jsx("p", { children: "Zero-knowledge password manager" }), _jsx("p", { className: "text-xs", children: "Licensed under AGPL-3.0 \u2022 Open Source" })] }) })] }), _jsxs("div", { className: "p-6 border-t border-dark-700 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "btn-ghost", children: "Cancel" }), _jsx("button", { onClick: handleSave, className: "btn-primary", children: "Save Settings" })] })] }), _jsx(TwoFactorSetupModal, { isOpen: show2FAModal, onClose: () => setShow2FAModal(false), onSuccess: handle2FASuccess, isAlreadyEnabled: user?.twoFactorEnabled })] }));
}
//# sourceMappingURL=SettingsModal.js.map