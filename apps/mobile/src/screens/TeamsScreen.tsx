import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useMobileStore } from '../store/mobile-store'
import { useSync } from '../hooks/useSync'

export default function TeamsScreen({ navigation }: { navigation: any }) {
    const { teams } = useMobileStore()
    const { fetchTeams } = useSync()
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        await fetchTeams()
        setLoading(false)
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchTeams()
        setRefreshing(false)
    }

    const renderTeamItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.teamCard}
            onPress={() => {/* Team details screen could go here */ }}
        >
            <View style={styles.teamIconContainer}>
                <MaterialCommunityIcons name="account-group" size={24} color="#667eea" />
            </View>
            <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.name}</Text>
                <Text style={styles.teamDescription} numberOfLines={1}>
                    {item.description || 'No description provided'}
                </Text>
                <View style={styles.teamStats}>
                    <View style={styles.stat}>
                        <MaterialCommunityIcons name="account" size={14} color="#94a3b8" />
                        <Text style={styles.statText}>{item._count?.members || 0} Members</Text>
                    </View>
                    <View style={styles.stat}>
                        <MaterialCommunityIcons name="shield-lock" size={14} color="#94a3b8" />
                        <Text style={styles.statText}>{item._count?.vaults || 0} Vaults</Text>
                    </View>
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#f1f5f9" />
                </TouchableOpacity>
                <Text style={styles.title}>Teams</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#667eea" />
                </View>
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTeamItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="account-group-outline" size={64} color="#334155" />
                            <Text style={styles.emptyText}>You are not part of any teams yet.</Text>
                            <Text style={styles.emptySubtext}>Use the desktop app to create or join a team.</Text>
                        </View>
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f1f5f9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    teamIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#667eea15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f1f5f9',
    },
    teamDescription: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    teamStats: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
        textAlign: 'center',
    }
})
