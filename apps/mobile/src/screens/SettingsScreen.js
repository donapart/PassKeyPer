import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Switch, Text, Surface } from 'react-native-paper';
import { useMobileStore } from '../store/mobile-store';
export default function SettingsScreen() {
    const { syncSettings, setSyncSettings, logout } = useMobileStore();
    // Local state for editing to avoid constant store updates on typing
    const [apiUrl, setApiUrl] = useState(syncSettings.apiUrl);
    const [autoSync, setAutoSync] = useState(syncSettings.autoSync);
    const handleSave = () => {
        setSyncSettings({
            apiUrl,
            autoSync
        });
        alert('Settings saved');
    };
    const handleLogout = () => {
        logout();
    };
    return (_jsx(ScrollView, { style: styles.container, children: _jsxs(View, { style: styles.content, children: [_jsxs(Surface, { style: styles.card, elevation: 1, children: [_jsx(Text, { variant: "titleMedium", style: styles.header, children: "Sync Settings" }), _jsx(TextInput, { label: "API Server URL", value: apiUrl, onChangeText: setApiUrl, mode: "outlined", style: styles.input, autoCapitalize: "none", autoCorrect: false }), _jsxs(View, { style: styles.switchRow, children: [_jsx(Text, { children: "Auto-Sync" }), _jsx(Switch, { value: autoSync, onValueChange: setAutoSync })] }), _jsx(Button, { mode: "contained", onPress: handleSave, style: styles.button, children: "Save Settings" })] }), _jsxs(Surface, { style: styles.card, elevation: 1, children: [_jsx(Text, { variant: "titleMedium", style: styles.header, children: "Account" }), _jsx(Button, { mode: "outlined", textColor: "#ef4444", onPress: handleLogout, style: styles.button, children: "Log Out" })] }), _jsx(Text, { style: styles.version, children: "Version 0.5.0" })] }) }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#1e293b',
        borderRadius: 8,
    },
    header: {
        marginBottom: 16,
        color: '#f1f5f9',
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#334155',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    version: {
        textAlign: 'center',
        color: '#64748b',
        marginTop: 16,
    }
});
//# sourceMappingURL=SettingsScreen.js.map