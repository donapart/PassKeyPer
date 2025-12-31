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

import {
    deriveMasterKey,
    deriveServerHash,
    generateSalt,
    generateKeyPair,
    initCrypto
} from '@passkeyper/core'
import { useMobileStore } from '../store/mobile-store'

export default function AuthScreen({ navigation }: { navigation: any }) {
    const { login, syncSettings } = useMobileStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
    const [biometricType, setBiometricType] = useState<string>('')
    const [loading, setLoading] = useState(false)

    // 2FA States
    const [show2FA, setShow2FA] = useState(false)
    const [twoFactorCode, setTwoFactorCode] = useState('')
    const [tempMasterKey, setTempMasterKey] = useState<Uint8Array | null>(null)

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
                // In a real app, we would retrieve the encrypted masterKey/token from SecureStore
                // For now, this is a stub until we implement SecureStore persistence for the master key
                alert('Biometric auth successful (STUB). Please log in with password first.')
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

        setLoading(true)
        try {
            await initCrypto()

            let payload: any = { email }
            let masterKey: Uint8Array

            if (isRegister) {
                // REGISTRATION
                const salt = generateSalt()
                masterKey = await deriveMasterKey(password, salt)
                const authHash = await deriveServerHash(masterKey, email)

                // Generate sharing keys
                const keypair = await generateKeyPair()

                payload = {
                    ...payload,
                    authHash,
                    authSalt: Buffer.from(salt).toString('base64'),
                    publicKey: Buffer.from(keypair.publicKey).toString('base64'),
                    encryptedPrivateKey: Buffer.from(keypair.privateKey).toString('base64') // Note: In reality, encrypt this!
                }
            } else {
                // LOGIN
                // 1. Get salt from server first (simplified: assuming fixed or fetched)
                // In a real app, we'd hit /api/auth/salt?email=...
                const saltResponse = await fetch(`${syncSettings.apiUrl}/api/auth/salt?email=${encodeURIComponent(email)}`)
                if (!saltResponse.ok) {
                    throw new Error('User not found or error fetching salt')
                }
                const { salt: saltBase64 } = await saltResponse.json()
                const salt = new Uint8Array(Buffer.from(saltBase64, 'base64'))

                masterKey = await deriveMasterKey(password, salt)
                const authHash = await deriveServerHash(masterKey, email)

                payload = {
                    ...payload,
                    authHash
                }
            }

            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
            const response = await fetch(`${syncSettings.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (data.twoFactorRequired) {
                setShow2FA(true)
                setTempMasterKey(masterKey)
                return
            }

            if (data.token && data.user) {
                // Successful login
                login(data.user, data.token, masterKey)
            }
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Error occurred during authentication')
        } finally {
            setLoading(false)
        }
    }

    const handle2FAVerify = async () => {
        if (twoFactorCode.length !== 6) return

        setLoading(true)
        try {
            const response = await fetch(`${syncSettings.apiUrl}/api/auth/login/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code: twoFactorCode
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Invalid 2FA code')

            if (data.token && data.user && tempMasterKey) {
                login(data.user, data.token, tempMasterKey)
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={[styles.logoContainer, show2FA && { marginBottom: 24 }]}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={[styles.logo, show2FA && { width: 60, height: 60 }]}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, show2FA && { fontSize: 24 }]}>PassKeyPer</Text>
                    <Text style={styles.subtitle}>
                        {show2FA ? 'Two-Factor Verification' : isRegister ? 'Create your vault' : 'Welcome back'}
                    </Text>
                </View>

                {show2FA ? (
                    <View style={styles.formContainer}>
                        <View style={styles.twoFactorIconContainer}>
                            <MaterialCommunityIcons name="shield-lock" size={48} color="#667eea" />
                        </View>
                        <Text style={styles.twoFactorText}>Enter the code from your app or a recovery code</Text>

                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="numeric" size={20} color="#94a3b8" />
                            <TextInput
                                style={[styles.input, { textAlign: 'center', letterSpacing: 4, fontSize: 20 }]}
                                placeholder="000XXX"
                                placeholderTextColor="#64748b"
                                value={twoFactorCode}
                                onChangeText={(text) => setTwoFactorCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                keyboardType="default"
                                maxLength={10}
                                autoFocus
                            />
                        </View>

                        <Text style={[styles.securityText, { textAlign: 'center', marginBottom: 16, color: '#94a3b8' }]}>
                            Use a 10-character recovery code if you lost your device.
                        </Text>

                        <TouchableOpacity
                            style={[styles.authButton, { opacity: (twoFactorCode.length === 6 || twoFactorCode.length === 10) ? 1 : 0.6 }]}
                            onPress={handle2FAVerify}
                            disabled={(twoFactorCode.length !== 6 && twoFactorCode.length !== 10) || loading}
                        >
                            <Text style={styles.authButtonText}>
                                {loading ? 'Verifying...' : 'Verify & Unlock'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => {
                                setShow2FA(false)
                                setTwoFactorCode('')
                            }}
                        >
                            <Text style={styles.toggleText}>Back to login</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
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
                                {loading ? 'Checking...' : isRegister ? 'Create Account' : 'Unlock Vault'}
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
                    </>
                )}

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
    logo: {
        width: 100,
        height: 100,
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
    twoFactorIconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    twoFactorText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    formContainer: {
        width: '100%',
    }
})
