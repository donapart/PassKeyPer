import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, Plus, Shield, Search, MoreVertical, UserPlus, Trash2, ArrowLeft, Settings } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { toast } from './Toast';
import { TeamInviteModal } from './TeamInviteModal';
import { TeamVaultModal } from './TeamVaultModal';
import { TeamSettingsModal } from './TeamSettingsModal';
export function TeamsView() {
    const { setCurrentVault, setCurrentView } = useAppStore();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showVaultModal, setShowVaultModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const authToken = localStorage.getItem('auth_token') || '';
    useEffect(() => {
        loadTeams();
    }, []);
    const loadTeams = async () => {
        setIsLoading(true);
        try {
            const result = await window.electronAPI.listTeams(authToken);
            setTeams(result.teams || []);
        }
        catch (error) {
            console.error('Failed to load teams', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim())
            return;
        try {
            await window.electronAPI.createTeam({ name: newTeamName }, authToken);
            toast.success(`Team "${newTeamName}" created`);
            setNewTeamName('');
            setShowCreateModal(false);
            loadTeams();
        }
        catch (error) {
            toast.error(error.message || 'Failed to create team');
        }
    };
    const handleSelectTeam = async (team) => {
        try {
            const result = await window.electronAPI.getTeam(team.id, authToken);
            setSelectedTeam(result.team);
        }
        catch (error) {
            console.error('Failed to get team details', error);
        }
    };
    const handleRefreshDetails = async () => {
        if (selectedTeam) {
            try {
                const result = await window.electronAPI.getTeam(selectedTeam.id, authToken);
                setSelectedTeam(result.team);
            }
            catch (error) {
                // If team not found (deleted), go back
                setSelectedTeam(null);
            }
        }
        loadTeams();
    };
    if (selectedTeam) {
        return (_jsxs("div", { className: "flex-1 flex flex-col animate-fadeIn", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 bg-dark-800/50 backdrop-blur-md sticky top-0 z-10", children: [_jsxs("button", { onClick: () => setSelectedTeam(null), className: "flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Teams"] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center border border-primary-500/30", children: _jsx(Users, { className: "w-6 h-6 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: selectedTeam.name }), _jsx("p", { className: "text-dark-400", children: selectedTeam.description || 'No description provided' })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setShowPolicyModal(true), className: "btn-secondary flex items-center gap-2 text-sm", children: [_jsx(Shield, { className: "w-4 h-4" }), "Policy"] }), _jsxs("button", { onClick: () => setShowSettingsModal(true), className: "btn-secondary flex items-center gap-2 text-sm", children: [_jsx(Settings, { className: "w-4 h-4" }), "Settings"] }), _jsxs("button", { onClick: () => setShowInviteModal(true), className: "btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-900/20", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Add Member"] })] })] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-8", children: [_jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-sm font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-primary-500" }), "Team Vaults"] }), _jsxs("button", { onClick: () => setShowVaultModal(true), className: "text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors", children: [_jsx(Plus, { className: "w-3 h-3" }), "Create Vault"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: selectedTeam.vaults?.length > 0 ? (selectedTeam.vaults.map((vault) => (_jsxs("div", { onClick: () => {
                                            setCurrentVault(vault);
                                            setCurrentView('vaults');
                                        }, className: "card p-4 flex items-center justify-between group bg-dark-800/30 border-dark-700/30 hover:bg-dark-800/50 hover:border-primary-500/30 transition-all cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 group-hover:text-primary-400 transition-colors", children: _jsx(Shield, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-primary-400 transition-colors", children: vault.name }), _jsx("p", { className: "text-[10px] text-dark-500 uppercase tracking-tighter", children: "Shared Team Vault" })] })] }), _jsx("div", { className: "text-right", children: _jsx("p", { className: "text-xs font-mono text-dark-400", children: vault.type }) })] }, vault.id)))) : (_jsxs("div", { className: "col-span-full p-8 bg-dark-800/20 border border-dashed border-dark-700 rounded-xl flex flex-col items-center justify-center text-center opacity-60", children: [_jsx(Shield, { className: "w-8 h-8 text-dark-600 mb-2" }), _jsx("p", { className: "text-sm text-dark-500 font-medium", children: "No vaults discovered in this team yet." })] })) })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-sm font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-primary-500" }), "Members"] }), _jsxs("span", { className: "px-2 py-0.5 bg-dark-700 rounded text-xs text-dark-300", children: [selectedTeam.members?.length || 0, " Total"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: selectedTeam.members?.map((member) => (_jsxs("div", { className: "card p-4 flex items-center justify-between group bg-dark-800/50 border-dark-700/50 hover:border-dark-600 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center font-bold text-gray-300 shadow-inner", children: member.user.email[0].toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-white truncate max-w-[140px]", children: member.user.email }), _jsx("span", { className: `text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${member.role === 'OWNER' ? 'bg-amber-900/30 text-amber-400' :
                                                                    member.role === 'ADMIN' ? 'bg-blue-900/30 text-blue-400' :
                                                                        'bg-dark-700/50 text-dark-400'}`, children: member.role })] })] }), _jsx("button", { className: "text-dark-500 hover:text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, member.id))) })] })] }), _jsx(TeamInviteModal, { isOpen: showInviteModal, onClose: () => setShowInviteModal(false), teamId: selectedTeam.id, teamName: selectedTeam.name, onSuccess: handleRefreshDetails }), _jsx(TeamVaultModal, { isOpen: showVaultModal, onClose: () => setShowVaultModal(false), teamId: selectedTeam.id, teamName: selectedTeam.name, onSuccess: handleRefreshDetails }), _jsx(TeamSettingsModal, { isOpen: showSettingsModal, onClose: () => setShowSettingsModal(false), team: selectedTeam, onSuccess: handleRefreshDetails }), _jsx(SecurityPolicyModal, { isOpen: showPolicyModal, onClose: () => setShowPolicyModal(false), team: selectedTeam, onSuccess: handleRefreshDetails })] }));
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Teams" }), _jsx("p", { className: "text-dark-400", children: "Collaborate securely with your groups" })] }), _jsxs("button", { onClick: () => setShowCreateModal(true), className: "btn-primary flex items-center gap-2 shadow-lg shadow-primary-900/20", children: [_jsx(Plus, { className: "w-5 h-5" }), "Create Team"] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" }), _jsx("input", { type: "text", placeholder: "Search teams...", className: "input pl-11 w-full bg-dark-800/50 focus:bg-dark-800 transition-colors" })] }), isLoading ? (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" }) })) : teams.length === 0 ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-12 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700", children: [_jsx("div", { className: "w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4 shadow-xl border border-dark-700", children: _jsx(Users, { className: "w-10 h-10 text-dark-600" }) }), _jsx("h2", { className: "text-xl font-semibold text-white mb-2", children: "Build Your First Team" }), _jsx("p", { className: "text-dark-400 max-w-sm mb-6", children: "Teams let you share vaults with family, friends, or coworkers while maintaining full control." }), _jsx("button", { onClick: () => setShowCreateModal(true), className: "btn-secondary", children: "Learn about Teams" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: teams.map((team) => (_jsxs("button", { onClick: () => handleSelectTeam(team), className: "card p-6 text-left hover:border-primary-600 transition-all group relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary-600/10 transition-colors" }), _jsxs("div", { className: "flex items-start justify-between mb-4 relative", children: [_jsx("div", { className: "w-12 h-12 bg-dark-700/50 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20 border border-dark-600 group-hover:border-primary-500/30 transition-all", children: _jsx(Users, { className: "w-6 h-6" }) }), _jsx("button", { className: "p-1 px-2 text-dark-500 hover:text-white hover:bg-dark-700 rounded transition-colors", children: _jsx(MoreVertical, { className: "w-5 h-5" }) })] }), _jsx("h3", { className: "text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors", children: team.name }), _jsx("p", { className: "text-sm text-dark-400 line-clamp-2 mb-4 h-10", children: team.description || 'Secure collaboration space for your team members.' }), _jsxs("div", { className: "flex items-center gap-4 text-xs font-mono font-bold text-dark-500 border-t border-dark-700/50 pt-4", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-green-500 rounded-full" }), team._count.members, " MEMBERS"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-primary-500 rounded-full" }), team._count.vaults, " VAULTS"] })] })] }, team.id))) })), showCreateModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-primary-600/20 to-blue-600/20 p-6 border-b border-dark-700", children: _jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-3", children: [_jsx(Plus, { className: "w-5 h-5 text-primary-400" }), "Create New Team"] }) }), _jsxs("form", { onSubmit: handleCreateTeam, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold text-dark-400 mb-2 font-mono uppercase tracking-tighter", children: "Team Name" }), _jsx("input", { autoFocus: true, type: "text", value: newTeamName, onChange: (e) => setNewTeamName(e.target.value), placeholder: "e.g. Engineering Team", className: "input w-full", required: true })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 font-mono", children: [_jsx("button", { type: "button", onClick: () => setShowCreateModal(false), className: "btn-ghost", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary px-8", children: "Create" })] })] })] }) }))] }));
}
//# sourceMappingURL=TeamsView.js.map