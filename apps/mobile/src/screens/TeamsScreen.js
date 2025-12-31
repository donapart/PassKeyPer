import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileStore } from '../store/mobile-store';
import { useSync } from '../hooks/useSync';
export default function TeamsScreen({ navigation }) {
    const { teams } = useMobileStore();
    const { fetchTeams } = useSync();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        await fetchTeams();
        setLoading(false);
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTeams();
        setRefreshing(false);
    };
    const renderTeamItem = ({ item }) => (_jsxs(TouchableOpacity, { style: styles.teamCard, onPress: () => { }, children: [_jsx(View, { style: styles.teamIconContainer, children: _jsx(MaterialCommunityIcons, { name: "account-group", size: 24, color: "#667eea" }) }), _jsxs(View, { style: styles.teamInfo, children: [_jsx(Text, { style: styles.teamName, children: item.name }), _jsx(Text, { style: styles.teamDescription, numberOfLines: 1, children: item.description || 'No description provided' }), _jsxs(View, { style: styles.teamStats, children: [_jsxs(View, { style: styles.stat, children: [_jsx(MaterialCommunityIcons, { name: "account", size: 14, color: "#94a3b8" }), _jsxs(Text, { style: styles.statText, children: [item._count?.members || 0, " Members"] })] }), _jsxs(View, { style: styles.stat, children: [_jsx(MaterialCommunityIcons, { name: "shield-lock", size: 14, color: "#94a3b8" }), _jsxs(Text, { style: styles.statText, children: [item._count?.vaults || 0, " Vaults"] })] })] })] }), _jsx(MaterialCommunityIcons, { name: "chevron-right", size: 20, color: "#475569" })] }));
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(TouchableOpacity, { onPress: () => navigation.goBack(), children: _jsx(MaterialCommunityIcons, { name: "arrow-left", size: 24, color: "#f1f5f9" }) }), _jsx(Text, { style: styles.title, children: "Teams" }), _jsx(View, { style: { width: 24 } })] }), loading && !refreshing ? (_jsx(View, { style: styles.center, children: _jsx(ActivityIndicator, { size: "large", color: "#667eea" }) })) : (_jsx(FlatList, { data: teams, keyExtractor: (item) => item.id, renderItem: renderTeamItem, contentContainerStyle: styles.list, refreshControl: _jsx(RefreshControl, { refreshing: refreshing, onRefresh: onRefresh, tintColor: "#667eea" }), ListEmptyComponent: _jsxs(View, { style: styles.empty, children: [_jsx(MaterialCommunityIcons, { name: "account-group-outline", size: 64, color: "#334155" }), _jsx(Text, { style: styles.emptyText, children: "You are not part of any teams yet." }), _jsx(Text, { style: styles.emptySubtext, children: "Use the desktop app to create or join a team." })] }) }))] }));
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
});
//# sourceMappingURL=TeamsScreen.js.map