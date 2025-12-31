import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileStore } from '../store/mobile-store';
export function SyncStatusIndicator() {
    const { syncSettings, isAuthenticated } = useMobileStore();
    if (!isAuthenticated)
        return null;
    const lastSyncStr = syncSettings.lastSync
        ? new Date(syncSettings.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Never';
    return (_jsxs(View, { style: styles.container, children: [_jsx(View, { style: styles.statusDot }), _jsxs(Text, { style: styles.text, children: ["Cloud Sync: ", _jsx(Text, { style: styles.time, children: lastSyncStr })] }), syncSettings.autoSync && (_jsx(MaterialCommunityIcons, { name: "sync", size: 14, color: "#10b981", style: styles.icon }))] }));
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 8,
        opacity: 0.8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        marginRight: 8,
    },
    text: {
        fontSize: 12,
        color: '#94a3b8',
    },
    time: {
        color: '#f1f5f9',
        fontWeight: '600',
    },
    icon: {
        marginLeft: 6,
    }
});
//# sourceMappingURL=SyncStatusIndicator.js.map