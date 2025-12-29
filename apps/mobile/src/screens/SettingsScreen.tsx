import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { TextInput, Button, Switch, Text, Divider, Surface } from 'react-native-paper'
import { useMobileStore } from '../store/mobile-store'

export default function SettingsScreen() {
    const { syncSettings, setSyncSettings, logout } = useMobileStore()

    // Local state for editing to avoid constant store updates on typing
    const [apiUrl, setApiUrl] = useState(syncSettings.apiUrl)
    const [autoSync, setAutoSync] = useState(syncSettings.autoSync)

    const handleSave = () => {
        setSyncSettings({
            apiUrl,
            autoSync
        })
        alert('Settings saved')
    }

    const handleLogout = () => {
        logout()
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Surface style={styles.card} elevation={1}>
                    <Text variant="titleMedium" style={styles.header}>Sync Settings</Text>

                    <TextInput
                        label="API Server URL"
                        value={apiUrl}
                        onChangeText={setApiUrl}
                        mode="outlined"
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={styles.switchRow}>
                        <Text>Auto-Sync</Text>
                        <Switch value={autoSync} onValueChange={setAutoSync} />
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.button}
                    >
                        Save Settings
                    </Button>
                </Surface>

                <Surface style={styles.card} elevation={1}>
                    <Text variant="titleMedium" style={styles.header}>Account</Text>
                    <Button
                        mode="outlined"
                        textColor="#ef4444"
                        onPress={handleLogout}
                        style={styles.button}
                    >
                        Log Out
                    </Button>
                </Surface>

                <Text style={styles.version}>Version 0.5.0</Text>
            </View>
        </ScrollView>
    )
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
})
