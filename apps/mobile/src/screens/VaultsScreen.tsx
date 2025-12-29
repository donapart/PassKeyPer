/**
 * VaultsScreen - Select and manage vaults
 */

import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useMobileStore } from '../store/mobile-store'
import { useSync } from '../hooks/useSync'

interface VaultsScreenProps {
    navigation: any
}

export default function VaultsScreen({ navigation }: VaultsScreenProps) {
    const { vaults, currentVault, setCurrentVault, createVault } = useMobileStore()
    const { fetchVaults } = useSync()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newVaultName, setNewVaultName] = useState('')

    useEffect(() => {
        fetchVaults()
    }, [fetchVaults])

    const handleCreateVault = () => {
        if (newVaultName.trim()) {
            createVault(newVaultName.trim(), 'personal')
            setNewVaultName('')
            setShowCreateModal(false)
        }
    }

    const handleSelectVault = (vault: any) => {
        setCurrentVault(vault)
        navigation.navigate('Items', { vaultId: vault.id })
    }

    const getVaultIcon = (type: string) => {
        switch (type) {
            case 'personal':
                return 'account'
            case 'work':
                return 'briefcase'
            case 'family':
                return 'home'
            default:
                return 'folder'
        }
    }

    const getVaultColor = (type: string) => {
        switch (type) {
            case 'personal':
                return '#667eea'
            case 'work':
                return '#f59e0b'
            case 'family':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>PassKeyPer</Text>
                    <Text style={styles.subtitle}>Select a vault</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <MaterialCommunityIcons name="cog" size={24} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            {/* Vaults List */}
            {vaults.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="folder-open" size={64} color="#475569" />
                    <Text style={styles.emptyTitle}>No vaults yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Create your first vault to get started
                    </Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
                        <Text style={styles.createButtonText}>Create Vault</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={vaults}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.vaultCard,
                                    currentVault?.id === item.id && styles.vaultCardActive,
                                ]}
                                onPress={() => handleSelectVault(item)}
                            >
                                <View
                                    style={[
                                        styles.vaultIcon,
                                        { backgroundColor: `${getVaultColor(item.type)}20` },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={getVaultIcon(item.type)}
                                        size={32}
                                        color={getVaultColor(item.type)}
                                    />
                                </View>
                                <View style={styles.vaultInfo}>
                                    <Text style={styles.vaultName}>{item.name}</Text>
                                    <Text style={styles.vaultMeta}>
                                        {item.itemCount || 0} items • {item.type}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color="#475569"
                                />
                            </TouchableOpacity>
                        )}
                    />

                    {/* Floating Action Button */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
                    </TouchableOpacity>
                </>
            )}

            {/* Create Vault Modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Vault</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Vault name"
                            placeholderTextColor="#64748b"
                            value={newVaultName}
                            onChangeText={setNewVaultName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setShowCreateModal(false)
                                    setNewVaultName('')
                                }}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCreate]}
                                onPress={handleCreateVault}
                            >
                                <Text style={styles.modalButtonTextCreate}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
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
    settingsButton: {
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
})
