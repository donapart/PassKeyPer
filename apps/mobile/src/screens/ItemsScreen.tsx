/**
 * ItemsScreen - List of password items
 */

import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useMobileStore } from '../store/mobile-store'
import { useSync } from '../hooks/useSync'

interface ItemsScreenProps {
    navigation: any
    route: any
}

export default function ItemsScreen({ navigation, route }: ItemsScreenProps) {
    const { currentVault, items, searchQuery, setSearchQuery } = useMobileStore()
    const { fetchItems } = useSync()
    const [filteredItems, setFilteredItems] = useState(items)

    useEffect(() => {
        navigation.setOptions({
            title: currentVault?.name || 'Items',
        })

        // Fetch items for current vault
        if (currentVault?.id) {
            fetchItems(currentVault.id)
        }
    }, [currentVault])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.url?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredItems(filtered)
        } else {
            setFilteredItems(items)
        }
    }, [searchQuery, items])

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'password':
                return 'key'
            case 'note':
                return 'note-text'
            case 'card':
                return 'credit-card'
            case 'identity':
                return 'account-card'
            default:
                return 'file'
        }
    }

    const handleItemPress = (item: any) => {
        navigation.navigate('ItemDetail', { itemId: item.id })
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search passwords..."
                    placeholderTextColor="#64748b"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialCommunityIcons name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Items List */}
            {filteredItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                        name={searchQuery ? 'magnify' : 'key-plus'}
                        size={64}
                        color="#475569"
                    />
                    <Text style={styles.emptyTitle}>
                        {searchQuery ? 'No results found' : 'No passwords yet'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {searchQuery
                            ? 'Try a different search term'
                            : 'Add your first password to get started'}
                    </Text>
                    {!searchQuery && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('ItemDetail', { itemId: null })}
                        >
                            <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
                            <Text style={styles.addButtonText}>Add Password</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <>
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.itemCard}
                                onPress={() => handleItemPress(item)}
                            >
                                <View style={styles.itemIcon}>
                                    <MaterialCommunityIcons
                                        name={getItemIcon(item.type)}
                                        size={24}
                                        color="#667eea"
                                    />
                                </View>
                                <View style={styles.itemInfo}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        {item.favorite && (
                                            <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                                        )}
                                    </View>
                                    <Text style={styles.itemUsername} numberOfLines={1}>
                                        {item.username || item.url || 'No details'}
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
                        onPress={() => navigation.navigate('ItemDetail', { itemId: null })}
                    >
                        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
                    </TouchableOpacity>
                </>
            )}

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => navigation.navigate('Generator')}
                >
                    <MaterialCommunityIcons name="refresh" size={24} color="#667eea" />
                    <Text style={styles.bottomButtonText}>Generator</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="folder-multiple" size={24} color="#667eea" />
                    <Text style={styles.bottomButtonText}>Vaults</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <MaterialCommunityIcons name="cog" size={24} color="#667eea" />
                    <Text style={styles.bottomButtonText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchInput: {
        flex: 1,
        color: '#f1f5f9',
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#667eea20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
        flex: 1,
    },
    itemUsername: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 90,
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
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    bottomButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    bottomButtonText: {
        color: '#667eea',
        fontSize: 12,
        marginTop: 4,
    },
})
