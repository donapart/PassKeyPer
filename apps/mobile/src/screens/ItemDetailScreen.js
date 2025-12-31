import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ItemDetailScreen - View and edit password items
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Clipboard, } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileStore } from '../store/mobile-store';
export default function ItemDetailScreen({ navigation, route }) {
    const { itemId } = route.params || {};
    const { items, createItem, updateItem, deleteItem } = useMobileStore();
    // Helper to get item by ID
    const getItem = (id) => items.find(item => item.id === id);
    const [isEditing, setIsEditing] = useState(!itemId);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    useEffect(() => {
        if (itemId) {
            const item = getItem(itemId);
            if (item) {
                setName(item.name);
                setUsername(item.username || '');
                setPassword(item.password || '');
                setUrl(item.url || '');
                setNotes(item.notes || '');
                setIsFavorite(item.favorite || false);
            }
        }
        navigation.setOptions({
            title: itemId ? (isEditing ? 'Edit Item' : 'Item Details') : 'New Item',
            headerRight: () => itemId && !isEditing ? (_jsx(TouchableOpacity, { style: styles.headerButton, onPress: () => setIsEditing(true), children: _jsx(Text, { style: styles.headerButtonText, children: "Edit" }) })) : null,
        });
    }, [itemId, isEditing]);
    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        const itemData = {
            name: name.trim(),
            username,
            password,
            url,
            notes,
            favorite: isFavorite,
            type: 'password',
        };
        if (itemId) {
            updateItem(itemId, itemData);
        }
        else {
            createItem(itemData);
        }
        navigation.goBack();
    };
    const handleDelete = () => {
        Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    deleteItem(itemId);
                    navigation.goBack();
                },
            },
        ]);
    };
    const handleCopy = (text, label) => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };
    return (_jsxs(View, { style: styles.container, children: [_jsxs(ScrollView, { style: styles.content, contentContainerStyle: styles.scrollContent, children: [_jsxs(View, { style: styles.field, children: [_jsx(Text, { style: styles.label, children: "Name" }), _jsx(TextInput, { style: styles.input, value: name, onChangeText: setName, placeholder: "Item name", placeholderTextColor: "#64748b", editable: isEditing })] }), _jsxs(View, { style: styles.field, children: [_jsxs(View, { style: styles.labelRow, children: [_jsx(Text, { style: styles.label, children: "Username" }), !isEditing && username && (_jsx(TouchableOpacity, { onPress: () => handleCopy(username, 'Username'), children: _jsx(MaterialCommunityIcons, { name: "content-copy", size: 20, color: "#667eea" }) }))] }), _jsx(TextInput, { style: styles.input, value: username, onChangeText: setUsername, placeholder: "Username or email", placeholderTextColor: "#64748b", editable: isEditing, autoCapitalize: "none" })] }), _jsxs(View, { style: styles.field, children: [_jsxs(View, { style: styles.labelRow, children: [_jsx(Text, { style: styles.label, children: "Password" }), _jsxs(View, { style: styles.labelActions, children: [!isEditing && password && (_jsx(TouchableOpacity, { style: styles.iconButton, onPress: () => handleCopy(password, 'Password'), children: _jsx(MaterialCommunityIcons, { name: "content-copy", size: 20, color: "#667eea" }) })), _jsx(TouchableOpacity, { style: styles.iconButton, onPress: () => setShowPassword(!showPassword), children: _jsx(MaterialCommunityIcons, { name: showPassword ? 'eye-off' : 'eye', size: 20, color: "#667eea" }) })] })] }), _jsx(TextInput, { style: styles.input, value: password, onChangeText: setPassword, placeholder: "Password", placeholderTextColor: "#64748b", secureTextEntry: !showPassword, editable: isEditing, autoCapitalize: "none" })] }), _jsxs(View, { style: styles.field, children: [_jsx(Text, { style: styles.label, children: "Website" }), _jsx(TextInput, { style: styles.input, value: url, onChangeText: setUrl, placeholder: "https://example.com", placeholderTextColor: "#64748b", editable: isEditing, autoCapitalize: "none", keyboardType: "url" })] }), _jsxs(View, { style: styles.field, children: [_jsx(Text, { style: styles.label, children: "Notes" }), _jsx(TextInput, { style: [styles.input, styles.textArea], value: notes, onChangeText: setNotes, placeholder: "Additional notes...", placeholderTextColor: "#64748b", multiline: true, numberOfLines: 4, editable: isEditing })] }), _jsxs(TouchableOpacity, { style: styles.favoriteRow, onPress: () => isEditing && setIsFavorite(!isFavorite), disabled: !isEditing, children: [_jsx(MaterialCommunityIcons, { name: isFavorite ? 'star' : 'star-outline', size: 24, color: isFavorite ? '#fbbf24' : '#94a3b8' }), _jsx(Text, { style: styles.favoriteText, children: "Mark as favorite" })] }), itemId && isEditing && (_jsxs(TouchableOpacity, { style: styles.deleteButton, onPress: handleDelete, children: [_jsx(MaterialCommunityIcons, { name: "delete", size: 20, color: "#ef4444" }), _jsx(Text, { style: styles.deleteButtonText, children: "Delete Item" })] }))] }), isEditing && (_jsxs(View, { style: styles.actions, children: [_jsx(TouchableOpacity, { style: [styles.actionButton, styles.cancelButton], onPress: () => {
                            if (itemId) {
                                setIsEditing(false);
                                // Reset fields
                                const item = getItem(itemId);
                                if (item) {
                                    setName(item.name);
                                    setUsername(item.username || '');
                                    setPassword(item.password || '');
                                    setUrl(item.url || '');
                                    setNotes(item.notes || '');
                                    setIsFavorite(item.favorite || false);
                                }
                            }
                            else {
                                navigation.goBack();
                            }
                        }, children: _jsx(Text, { style: styles.cancelButtonText, children: "Cancel" }) }), _jsx(TouchableOpacity, { style: [styles.actionButton, styles.saveButton], onPress: handleSave, children: _jsx(Text, { style: styles.saveButtonText, children: "Save" }) })] }))] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        color: '#f1f5f9',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    favoriteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        marginBottom: 20,
    },
    favoriteText: {
        fontSize: 16,
        color: '#f1f5f9',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: '#7f1d1d',
        borderRadius: 12,
        marginTop: 8,
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#334155',
    },
    saveButton: {
        backgroundColor: '#667eea',
    },
    cancelButtonText: {
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerButton: {
        paddingRight: 16,
    },
    headerButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});
//# sourceMappingURL=ItemDetailScreen.js.map