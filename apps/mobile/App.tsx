/**
 * PassKeyPer Mobile App
 * Zero-knowledge password manager for iOS & Android
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Screens (to be created)
import AuthScreen from './src/screens/AuthScreen'
import VaultsScreen from './src/screens/VaultsScreen'
import ItemsScreen from './src/screens/ItemsScreen'
import ItemDetailScreen from './src/screens/ItemDetailScreen'
import GeneratorScreen from './src/screens/GeneratorScreen'
import SettingsScreen from './src/screens/SettingsScreen'

// Dark theme matching desktop app
const theme = {
    dark: true,
    colors: {
        primary: '#667eea',
        background: '#0f172a',
        card: '#1e293b',
        text: '#f1f5f9',
        border: '#334155',
        notification: '#667eea',
    },
}

import { useMobileStore } from './src/store/mobile-store'

const Stack = createStackNavigator()

export default function App() {
    const { isAuthenticated } = useMobileStore()

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer theme={theme}>
                    <StatusBar style="light" />

                    <Stack.Navigator
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: theme.colors.card,
                            },
                            headerTintColor: theme.colors.text,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                            cardStyle: {
                                backgroundColor: theme.colors.background,
                            },
                        }}
                    >
                        {!isAuthenticated ? (
                            // Auth Stack
                            <Stack.Screen
                                name="Auth"
                                options={{ headerShown: false }}
                            >
                                {(props) => (
                                    <AuthScreen
                                        {...props}
                                    />
                                )}
                            </Stack.Screen>
                        ) : (
                            // Main App Stack
                            <>
                                <Stack.Screen
                                    name="Vaults"
                                    component={VaultsScreen}
                                    options={{ title: 'PassKeyPer' }}
                                />
                                <Stack.Screen
                                    name="Items"
                                    component={ItemsScreen}
                                />
                                <Stack.Screen
                                    name="ItemDetail"
                                    component={ItemDetailScreen}
                                    options={{ title: 'Item Details' }}
                                />
                                <Stack.Screen
                                    name="Generator"
                                    component={GeneratorScreen}
                                    options={{ title: 'Password Generator' }}
                                />
                                <Stack.Screen
                                    name="Settings"
                                    component={SettingsScreen}
                                />
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    )
}
