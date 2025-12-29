/**
 * GeneratorScreen - Password generator
 */

import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Clipboard,
    Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'

export default function GeneratorScreen() {
    const [password, setPassword] = useState('')
    const [length, setLength] = useState(16)
    const [uppercase, setUppercase] = useState(true)
    const [lowercase, setLowercase] = useState(true)
    const [numbers, setNumbers] = useState(true)
    const [symbols, setSymbols] = useState(true)
    const [strength, setStrength] = useState(0)

    useEffect(() => {
        generatePassword()
    }, [length, uppercase, lowercase, numbers, symbols])

    const generatePassword = () => {
        let chars = ''
        if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
        if (numbers) chars += '0123456789'
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

        if (chars.length === 0) {
            setPassword('')
            return
        }

        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        setPassword(result)
        calculateStrength(result)
    }

    const calculateStrength = (pwd: string) => {
        let score = 0
        if (pwd.length >= 8) score++
        if (pwd.length >= 12) score++
        if (pwd.length >= 16) score++
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
        if (/\d/.test(pwd)) score++
        if (/[^a-zA-Z0-9]/.test(pwd)) score++
        setStrength(Math.min(score, 5))
    }

    const getStrengthColor = () => {
        if (strength <= 1) return '#ef4444'
        if (strength <= 2) return '#f97316'
        if (strength <= 3) return '#eab308'
        if (strength <= 4) return '#22c55e'
        return '#10b981'
    }

    const getStrengthText = () => {
        if (strength <= 1) return 'Weak'
        if (strength <= 2) return 'Fair'
        if (strength <= 3) return 'Good'
        if (strength <= 4) return 'Strong'
        return 'Excellent'
    }

    const handleCopy = () => {
        if (password) {
            Clipboard.setString(password)
            Alert.alert('Copied', 'Password copied to clipboard')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Generated Password */}
                <View style={styles.passwordContainer}>
                    <Text style={styles.password} selectable>
                        {password || 'Generate a password'}
                    </Text>
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopy}
                        disabled={!password}
                    >
                        <MaterialCommunityIcons
                            name="content-copy"
                            size={24}
                            color={password ? '#667eea' : '#475569'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Strength Indicator */}
                <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.strengthBar,
                                    {
                                        backgroundColor:
                                            i < strength ? getStrengthColor() : '#334155',
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                        {getStrengthText()}
                    </Text>
                </View>

                {/* Length Slider */}
                <View style={styles.option}>
                    <View style={styles.optionHeader}>
                        <Text style={styles.optionLabel}>Length</Text>
                        <Text style={styles.optionValue}>{length}</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={8}
                        maximumValue={32}
                        step={1}
                        value={length}
                        onValueChange={setLength}
                        minimumTrackTintColor="#667eea"
                        maximumTrackTintColor="#334155"
                        thumbTintColor="#667eea"
                    />
                </View>

                {/* Options */}
                <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setUppercase(!uppercase)}
                >
                    <View style={styles.toggleLeft}>
                        <MaterialCommunityIcons
                            name={uppercase ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={uppercase ? '#667eea' : '#64748b'}
                        />
                        <Text style={styles.toggleLabel}>Uppercase (A-Z)</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setLowercase(!lowercase)}
                >
                    <View style={styles.toggleLeft}>
                        <MaterialCommunityIcons
                            name={lowercase ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={lowercase ? '#667eea' : '#64748b'}
                        />
                        <Text style={styles.toggleLabel}>Lowercase (a-z)</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setNumbers(!numbers)}
                >
                    <View style={styles.toggleLeft}>
                        <MaterialCommunityIcons
                            name={numbers ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={numbers ? '#667eea' : '#64748b'}
                        />
                        <Text style={styles.toggleLabel}>Numbers (0-9)</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setSymbols(!symbols)}
                >
                    <View style={styles.toggleLeft}>
                        <MaterialCommunityIcons
                            name={symbols ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={symbols ? '#667eea' : '#64748b'}
                        />
                        <Text style={styles.toggleLabel}>Symbols (!@#$)</Text>
                    </View>
                </TouchableOpacity>

                {/* Generate Button */}
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generatePassword}
                >
                    <MaterialCommunityIcons name="refresh" size={20} color="#ffffff" />
                    <Text style={styles.generateButtonText}>Generate New</Text>
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
    content: {
        flex: 1,
        padding: 24,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#667eea',
    },
    password: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'monospace',
        color: '#f1f5f9',
        fontWeight: '600',
    },
    copyButton: {
        padding: 8,
        marginLeft: 8,
    },
    strengthContainer: {
        marginBottom: 32,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    option: {
        marginBottom: 24,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
    },
    optionValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    toggleOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#f1f5f9',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    generateButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
})
