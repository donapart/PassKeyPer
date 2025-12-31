import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * VaultsScreen - Select and manage vaults
 */
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileStore } from '../store/mobile-store';
import { useSync } from '../hooks/useSync';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
export default function VaultsScreen({ navigation }) {
    const { vaults, currentVault, setCurrentVault, createVault } = useMobileStore();
    const { fetchVaults } = useSync();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newVaultName, setNewVaultName] = useState('');
    useEffect(() => {
        fetchVaults();
    }, [fetchVaults]);
    const handleCreateVault = () => {
        if (newVaultName.trim()) {
            createVault(newVaultName.trim(), 'personal');
            setNewVaultName('');
            setShowCreateModal(false);
        }
    };
    const handleSelectVault = (vault) => {
        setCurrentVault(vault);
        navigation.navigate('Items', { vaultId: vault.id });
    };
    const getVaultIcon = (type) => {
        switch (type) {
            case 'personal':
                return 'account';
            case 'work':
                return 'briefcase';
            case 'family':
                return 'home';
            default:
                return 'folder';
        }
    };
    const getVaultColor = (type) => {
        switch (type) {
            case 'personal':
                return '#667eea';
            case 'work':
                return '#f59e0b';
            case 'family':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(View, { children: [_jsx(Text, { style: styles.title, children: "PassKeyPer" }), _jsx(Text, { style: styles.subtitle, children: "Select a vault" })] }), _jsxs(View, { style: styles.headerActions, children: [_jsx(TouchableOpacity, { style: styles.headerButton, onPress: () => navigation.navigate('Teams'), children: _jsx(MaterialCommunityIcons, { name: "account-group", size: 24, color: "#94a3b8" }) }), _jsx(TouchableOpacity, { style: styles.headerButton, onPress: () => navigation.navigate('Settings'), children: _jsx(MaterialCommunityIcons, { name: "cog", size: 24, color: "#94a3b8" }) })] })] }), _jsx(SyncStatusIndicator, {}), vaults.length === 0 ? (_jsxs(View, { style: styles.emptyState, children: [_jsx(MaterialCommunityIcons, { name: "folder-open", size: 64, color: "#475569" }), _jsx(Text, { style: styles.emptyTitle, children: "No vaults yet" }), _jsx(Text, { style: styles.emptySubtitle, children: "Create your first vault to get started" }), _jsxs(TouchableOpacity, { style: styles.createButton, onPress: () => setShowCreateModal(true), children: [_jsx(MaterialCommunityIcons, { name: "plus", size: 20, color: "#ffffff" }), _jsx(Text, { style: styles.createButtonText, children: "Create Vault" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(FlatList, { data: vaults, keyExtractor: (item) => item.id, contentContainerStyle: styles.listContainer, renderItem: ({ item }) => (_jsxs(TouchableOpacity, { style: [
                                styles.vaultCard,
                                currentVault?.id === item.id && styles.vaultCardActive,
                            ], onPress: () => handleSelectVault(item), children: [_jsx(View, { style: [
                                        styles.vaultIcon,
                                        { backgroundColor: `${getVaultColor(item.type)}20` },
                                    ], children: _jsx(MaterialCommunityIcons, { name: getVaultIcon(item.type), size: 32, color: getVaultColor(item.type) }) }), _jsxs(View, { style: styles.vaultInfo, children: [_jsxs(View, { style: styles.vaultNameRow, children: [_jsx(Text, { style: styles.vaultName, children: item.name }), item.team && (_jsx(View, { style: styles.teamBadge, children: _jsx(Text, { style: styles.teamBadgeText, children: item.team.name }) }))] }), _jsxs(Text, { style: styles.vaultMeta, children: [item._count?.items || 0, " items \u2022 ", item.type] })] }), _jsx(MaterialCommunityIcons, { name: "chevron-right", size: 24, color: "#475569" })] })) }), _jsx(TouchableOpacity, { style: styles.fab, onPress: () => setShowCreateModal(true), children: _jsx(MaterialCommunityIcons, { name: "plus", size: 28, color: "#ffffff" }) })] })), _jsx(Modal, { visible: showCreateModal, transparent: true, animationType: "fade", onRequestClose: () => setShowCreateModal(false), children: _jsx(View, { style: styles.modalOverlay, children: _jsxs(View, { style: styles.modalContent, children: [_jsx(Text, { style: styles.modalTitle, children: "Create Vault" }), _jsx(TextInput, { style: styles.modalInput, placeholder: "Vault name", placeholderTextColor: "#64748b", value: newVaultName, onChangeText: setNewVaultName, autoFocus: true }), _jsxs(View, { style: styles.modalButtons, children: [_jsx(TouchableOpacity, { style: [styles.modalButton, styles.modalButtonCancel], onPress: () => {
                                            setShowCreateModal(false);
                                            setNewVaultName('');
                                        }, children: _jsx(Text, { style: styles.modalButtonTextCancel, children: "Cancel" }) }), _jsx(TouchableOpacity, { style: [styles.modalButton, styles.modalButtonCreate], onPress: handleCreateVault, children: _jsx(Text, { style: styles.modalButtonTextCreate, children: "Create" }) })] })] }) }) })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f1f5f9',
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f1f5f9',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
        textAlign: 'center',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    listContainer: {
        padding: 24,
        paddingTop: 8,
    },
    vaultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    vaultCardActive: {
        borderColor: '#667eea',
        backgroundColor: '#1e293b',
    },
    vaultIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    vaultInfo: {
        flex: 1,
    },
    vaultName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f1f5f9',
    },
    vaultNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    teamBadge: {
        backgroundColor: '#667eea20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#667eea40',
    },
    teamBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#a5b4fc',
        textTransform: 'uppercase',
    },
    vaultMeta: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 16,
        color: '#f1f5f9',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#334155',
    },
    modalButtonCreate: {
        backgroundColor: '#667eea',
    },
    modalButtonTextCancel: {
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonTextCreate: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
//# sourceMappingURL=VaultsScreen.js.map