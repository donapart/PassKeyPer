import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Screens (to be created)
import AuthScreen from './src/screens/AuthScreen';
import VaultsScreen from './src/screens/VaultsScreen';
import ItemsScreen from './src/screens/ItemsScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import GeneratorScreen from './src/screens/GeneratorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TeamsScreen from './src/screens/TeamsScreen';
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
};
import { useMobileStore } from './src/store/mobile-store';
const Stack = createStackNavigator();
export default function App() {
    const { isAuthenticated } = useMobileStore();
    return (_jsx(SafeAreaProvider, { children: _jsx(PaperProvider, { theme: theme, children: _jsxs(NavigationContainer, { theme: theme, children: [_jsx(StatusBar, { style: "light" }), _jsx(Stack.Navigator, { screenOptions: {
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
                        }, children: !isAuthenticated ? (
                        // Auth Stack
                        _jsx(Stack.Screen, { name: "Auth", options: { headerShown: false }, children: (props) => (_jsx(AuthScreen, { ...props })) })) : (
                        // Main App Stack
                        _jsxs(_Fragment, { children: [_jsx(Stack.Screen, { name: "Vaults", component: VaultsScreen, options: { title: 'PassKeyPer' } }), _jsx(Stack.Screen, { name: "Items", component: ItemsScreen }), _jsx(Stack.Screen, { name: "ItemDetail", component: ItemDetailScreen, options: { title: 'Item Details' } }), _jsx(Stack.Screen, { name: "Generator", component: GeneratorScreen, options: { title: 'Password Generator' } }), _jsx(Stack.Screen, { name: "Teams", component: TeamsScreen, options: { headerShown: false } }), _jsx(Stack.Screen, { name: "Settings", component: SettingsScreen })] })) })] }) }) }));
}
//# sourceMappingURL=App.js.map