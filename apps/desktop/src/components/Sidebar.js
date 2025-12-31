import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import pkpLogo from '../assets/pkp_logo.png';
import { KeyRound, ChevronDown, FolderPlus, Lock, Download, Upload, Mail, ShieldCheck, Users } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { InvitesModal } from './InvitesModal';
export function Sidebar() {
    const { vaults, currentVault, setCurrentVault, sidebarCollapsed, currentView, setCurrentView } = useAppStore();
    const [showVaultMenu, setShowVaultMenu] = useState(false);
    const [showInvitesModal, setShowInvitesModal] = useState(false);
    const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const token = localStorage.getItem('auth_token') || '';
                const invites = await window.electronAPI.listInvites('received', token);
                setPendingInvitesCount(invites.length);
            }
            catch (e) {
                console.error('Failed to load invite count', e);
            }
        };
        loadCounts();
    }, []);
    const handleCreateVault = async () => {
        const name = prompt('Enter vault name:');
        if (!name)
            return;
        try {
            const newVault = await window.electronAPI.createVault({
                userId: '', // Will be set by backend
                name,
                type: 'personal',
                encryptedKey: '', // Will be generated
            });
            // Reload vaults
            const vaults = await window.electronAPI.listVaults();
            useAppStore.setState({ vaults });
            // Select new vault
            setCurrentVault(newVault);
        }
        catch (error) {
            toast.error('Failed to create vault: ' + error.message);
        }
    };
    const handleLockVault = async () => {
        await window.electronAPI.lockVault();
        useAppStore.setState({ isLocked: true });
    };
    if (sidebarCollapsed) {
        return (_jsxs("div", { className: "w-16 bg-dark-900 border-r border-dark-800 flex flex-col items-center py-4", children: [_jsx("div", { className: "mb-4 mt-2", children: _jsx("img", { src: pkpLogo, alt: "PKP", className: "w-8 h-8 rounded-lg" }) }), _jsx("button", { onClick: () => useAppStore.setState({ sidebarCollapsed: false }), className: "w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg mb-2", children: _jsx(KeyRound, { className: "w-5 h-5 text-dark-400" }) }), _jsxs("button", { onClick: () => {
                        useAppStore.setState({ sidebarCollapsed: false });
                        setShowInvitesModal(true);
                    }, className: "w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg relative", children: [_jsx(Mail, { className: "w-5 h-5 text-dark-400" }), pendingInvitesCount > 0 && (_jsx("span", { className: "absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border border-dark-900" }))] })] }));
    }
    return (_jsxs("div", { className: "w-64 bg-dark-900 border-r border-dark-800 flex flex-col", children: [_jsxs("div", { className: "p-4 flex items-center gap-3 border-b border-dark-800 bg-dark-900", children: [_jsx("img", { src: pkpLogo, alt: "PassKeyPer", className: "w-8 h-8 rounded-lg" }), _jsx("span", { className: "font-bold text-lg tracking-tight text-white", children: "PassKeyPer" })] }), _jsxs("div", { className: "p-4 border-b border-dark-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "text-sm font-semibold text-gray-400 uppercase tracking-wide", children: "Vaults" }), _jsx("button", { onClick: handleCreateVault, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded-lg transition-colors", title: "Create vault", children: _jsx(FolderPlus, { className: "w-4 h-4 text-dark-400" }) })] }), currentVault && (_jsxs("button", { onClick: () => setShowVaultMenu(!showVaultMenu), className: "w-full flex items-center justify-between px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Vault, { className: "w-4 h-4 text-primary-400" }), _jsx("span", { className: "text-sm font-medium text-white truncate", children: currentVault.name })] }), _jsx(ChevronDown, { className: "w-4 h-4 text-dark-400" })] }))] }), showVaultMenu && (_jsx("div", { className: "border-b border-dark-800 bg-dark-850 p-2", children: vaults.map((vault) => (_jsxs("button", { onClick: () => {
                        setCurrentVault(vault);
                        setCurrentView('vaults');
                        setShowVaultMenu(false);
                    }, className: `w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${vault.id === currentVault?.id
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'hover:bg-dark-800 text-gray-300'}`, children: [_jsx(Vault, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm truncate", children: vault.name })] }, vault.id))) })), _jsxs("div", { className: "flex-1 overflow-auto p-4 space-y-1", children: [_jsx("div", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-2", children: "Team & Sharing" }), _jsxs("button", { onClick: () => setShowInvitesModal(true), className: "w-full flex items-center justify-between px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-300 group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Mail, { className: "w-4 h-4 text-dark-400 group-hover:text-primary-400" }), _jsx("span", { className: "text-sm font-medium", children: "Invitations" })] }), pendingInvitesCount > 0 && (_jsx("span", { className: "px-1.5 py-0.5 bg-primary-600 text-[10px] font-bold text-white rounded-full", children: pendingInvitesCount }))] }), _jsx("button", { onClick: () => setCurrentView('teams'), className: `w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${currentView === 'teams' ? 'bg-primary-600/20 text-primary-400' : 'hover:bg-dark-800 text-gray-300'}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: `w-4 h-4 ${currentView === 'teams' ? 'text-primary-400' : 'text-dark-400 group-hover:text-primary-400'}` }), _jsx("span", { className: "text-sm font-medium", children: "Teams" })] }) }), _jsx("div", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6", children: "Quick Access" }), _jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-300 group", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-dark-400 group-hover:text-green-400" }), _jsx("span", { className: "text-sm font-medium", children: "Security Audit" })] })] }), _jsxs("div", { className: "p-4 border-t border-dark-800 space-y-2", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [_jsxs("button", { onClick: () => useAppStore.setState({ showImportModal: true }), className: "flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg transition-colors text-blue-400", title: "Import passwords", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Import" })] }), _jsxs("button", { onClick: () => useAppStore.setState({ showExportModal: true }), className: "flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg transition-colors text-purple-400", title: "Export passwords", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Export" })] })] }), _jsxs("button", { onClick: handleLockVault, className: "w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-yellow-500", children: [_jsx(Lock, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Lock Vault" })] }), _jsxs("button", { onClick: () => {
                            const event = new KeyboardEvent('keydown', {
                                key: ',',
                                ctrlKey: true,
                            });
                            window.dispatchEvent(event);
                        }, className: "w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors text-gray-400", children: [_jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] }), _jsx("span", { className: "text-sm font-medium", children: "Settings" })] })] }), _jsx(InvitesModal, { isOpen: showInvitesModal, onClose: () => setShowInvitesModal(false), onRefresh: handleRefreshVaults })] }));
}
//# sourceMappingURL=Sidebar.js.map