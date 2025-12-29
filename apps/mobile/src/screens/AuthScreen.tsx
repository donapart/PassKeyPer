/**
 * AuthScreen - Mobile login with biometric support
 */

import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface AuthScreenProps {
    navigation: any
    onAuthenticated: () => void
}

export default function AuthScreen({ navigation, onAuthenticated }: AuthScreenProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
    const [biometricType, setBiometricType] = useState<string>('')

    useEffect(() => {
        checkBiometric()
    }, [])

    const checkBiometric = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync()
        setIsBiometricAvailable(compatible)

        if (compatible) {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometricType('Face ID')
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometricType('Touch ID')
            } else {
                setBiometricType('Biometric')
            }
        }
    }

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access PassKeyPer',
                fallbackLabel: 'Use Password',
            })

            if (result.success) {
                // Check if user exists in secure storage
                // For now, just authenticate
                onAuthenticated()
            }
        } catch (error) {
            console.error('Biometric auth error:', error)
        }
    }

    const handlePasswordAuth = async () => {
        if (!email || !password) {
            alert('Please enter email and password')
            return
        }

        // TODO: Implement actual authentication with @passkeyper/core
        // For now, just authenticate
        if (password.length >= 8) {
            onAuthenticated()
        } else {
            alert('Password must be at least 8 characters')
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="shield-key" size={80} color="#667eea" />
                    <Text style={styles.title}>PassKeyPer</Text>
                    <Text style={styles.subtitle}>
                        {isRegister ? 'Create your vault' : 'Welcome back'}
                    </Text>
                </View>

                {/* Biometric Button */}
                {isBiometricAvailable && !isRegister && (
                    <TouchableOpacity
                        style={styles.biometricButton}
                        onPress={handleBiometricAuth}
                    >
                        <MaterialCommunityIcons
                            name={
                                biometricType === 'Face ID'
                                    ? 'face-recognition'
                                    : 'fingerprint'
                            }
                            size={32}
                            color="#667eea"
                        />
                        <Text style={styles.biometricText}>
                            Unlock with {biometricType}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                {isBiometricAvailable && !isRegister && (
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>
                )}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#64748b"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.input}
                        placeholder="Master Password"
                        placeholderTextColor="#64748b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Auth Button */}
                <TouchableOpacity
                    style={styles.authButton}
                    onPress={handlePasswordAuth}
                >
                    <Text style={styles.authButtonText}>
                        {isRegister ? 'Create Account' : 'Unlock Vault'}
                    </Text>
                </TouchableOpacity>

                {/* Toggle Register/Login */}
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setIsRegister(!isRegister)}
                >
                    <Text style={styles.toggleText}>
                        {isRegister
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Create one"}
                    </Text>
                </TouchableOpacity>

                {/* Security Note */}
                <View style={styles.securityNote}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#10b981" />
                    <Text style={styles.securityText}>
                        Zero-knowledge encryption • Your data, your keys
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 8,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#667eea',
        marginBottom: 24,
    },
    biometricText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155',
    },
    dividerText: {
        color: '#64748b',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    input: {
        flex: 1,
        color: '#f1f5f9',
        fontSize: 16,
        paddingVertical: 16,
        paddingLeft: 12,
    },
    authButton: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    toggleButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 12,
        backgroundColor: '#064e3b',
        borderRadius: 8,
    },
    securityText: {
        color: '#10b981',
        fontSize: 12,
        marginLeft: 8,
    },
})
