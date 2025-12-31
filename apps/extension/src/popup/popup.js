import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Browser Extension Popup
 * Main interface for the PassKeyPer extension
 */
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';
import './popup.css';
function Popup() {
    const [isLocked, setIsLocked] = useState(true);
    const [credentials, setCredentials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('credentials');
    const [toast, setToast] = useState(null);
    // Generator state
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    useEffect(() => {
        // Get current tab URL
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0]?.url) {
                setCurrentUrl(tabs[0].url);
            }
        });
        // Check if desktop app is running
        checkDesktopApp();
        generatePassword();
    }, []);
    useEffect(() => {
        generatePassword();
    }, [length, options]);
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };
    const generatePassword = () => {
        let chars = '';
        if (options.uppercase)
            chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase)
            chars += 'abcdefghijklmnopqrstuvwxyz';
        if (options.numbers)
            chars += '0123456789';
        if (options.symbols)
            chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (chars.length === 0) {
            setPassword('');
            return;
        }
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
    };
    const getPasswordStrength = () => {
        let score = 0;
        if (password.length >= 8)
            score++;
        if (password.length >= 12)
            score++;
        if (password.length >= 16)
            score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password))
            score++;
        if (/\d/.test(password))
            score++;
        if (/[^a-zA-Z0-9]/.test(password))
            score++;
        return Math.min(score, 5);
    };
    const getStrengthColor = () => {
        const strength = getPasswordStrength();
        if (strength <= 1)
            return '#ef4444';
        if (strength <= 2)
            return '#f97316';
        if (strength <= 3)
            return '#eab308';
        if (strength <= 4)
            return '#22c55e';
        return '#10b981';
    };
    const getStrengthLabel = () => {
        const strength = getPasswordStrength();
        if (strength <= 1)
            return 'Weak';
        if (strength <= 2)
            return 'Fair';
        if (strength <= 3)
            return 'Good';
        if (strength <= 4)
            return 'Strong';
        return 'Excellent';
    };
    const checkDesktopApp = async () => {
        try {
            // Send message to desktop app via native messaging
            const response = await browser.runtime.sendNativeMessage('com.passkeyper.native', {
                type: 'PING'
            });
            if (response.success) {
                setIsLocked(false);
                loadCredentials();
            }
        }
        catch (error) {
            console.error('Desktop app not running:', error);
            setLoading(false);
        }
    };
    const loadCredentials = async () => {
        setLoading(true);
        try {
            const response = await browser.runtime.sendMessage({
                type: 'GET_CREDENTIALS',
                payload: { url: currentUrl }
            });
            if (response.success) {
                setCredentials(response.credentials || []);
            }
        }
        catch (error) {
            console.error('Failed to load credentials:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFill = async (credential) => {
        // Send to content script
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                type: 'FILL_CREDENTIALS',
                payload: credential
            });
            window.close();
        }
    };
    const handleCopy = async (text, field) => {
        await navigator.clipboard.writeText(text);
        showToast(`${field} copied!`);
    };
    const openDesktopApp = () => {
        // Send message to open desktop app
        browser.runtime.sendNativeMessage('com.passkeyper.native', {
            type: 'OPEN_APP'
        });
    };
    const filteredCredentials = credentials.filter((cred) => cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.username.toLowerCase().includes(searchQuery.toLowerCase()));
    if (loading) {
        return (_jsxs("div", { className: "popup", children: [_jsx("div", { className: "popup-header", children: _jsxs("div", { className: "header-brand", children: [_jsx("span", { className: "logo", children: "\uD83D\uDD10" }), _jsx("h1", { children: "PassKeyPer" })] }) }), _jsxs("div", { className: "popup-loading", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Loading..." })] })] }));
    }
    if (isLocked) {
        return (_jsxs("div", { className: "popup", children: [_jsx("div", { className: "popup-header", children: _jsxs("div", { className: "header-brand", children: [_jsx("span", { className: "logo", children: "\uD83D\uDD10" }), _jsx("h1", { children: "PassKeyPer" })] }) }), _jsxs("div", { className: "popup-locked", children: [_jsx("div", { className: "lock-icon", children: "\uD83D\uDD12" }), _jsx("h2", { children: "Desktop App Required" }), _jsx("p", { children: "Please open the PassKeyPer desktop app to use the extension." }), _jsx("button", { onClick: openDesktopApp, className: "btn-primary", children: "Open Desktop App" }), _jsx("a", { href: "https://github.com/donapart/PassKeyPer", target: "_blank", className: "link", children: "Download Desktop App" })] })] }));
    }
    return (_jsxs("div", { className: "popup", children: [toast && _jsx("div", { className: "toast", children: toast }), _jsxs("div", { className: "popup-header", children: [_jsxs("div", { className: "header-brand", children: [_jsx("span", { className: "logo", children: "\uD83D\uDD10" }), _jsx("h1", { children: "PassKeyPer" })] }), _jsx("div", { className: "header-actions", children: _jsx("button", { className: "icon-btn", title: "Open Desktop App", onClick: openDesktopApp, children: "\u2699\uFE0F" }) })] }), _jsxs("div", { className: "tabs", children: [_jsx("button", { className: `tab ${activeTab === 'credentials' ? 'active' : ''}`, onClick: () => setActiveTab('credentials'), children: "\uD83D\uDD11 Passwords" }), _jsx("button", { className: `tab ${activeTab === 'generator' ? 'active' : ''}`, onClick: () => setActiveTab('generator'), children: "\uD83C\uDFB2 Generator" })] }), _jsxs("div", { className: "popup-content", children: [activeTab === 'credentials' && (_jsxs(_Fragment, { children: [currentUrl && (_jsxs("div", { className: "current-site", children: [_jsx("span", { className: "site-icon", children: "\uD83C\uDF10" }), _jsx("span", { className: "site-url", children: new URL(currentUrl).hostname })] })), _jsx("div", { className: "search-box", children: _jsx("input", { type: "text", placeholder: "Search credentials...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" }) }), _jsx("div", { className: "credentials-list", children: filteredCredentials.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "No credentials found" }), _jsx("button", { onClick: openDesktopApp, className: "btn-secondary", children: "Add New in Desktop App" })] })) : (filteredCredentials.map((cred) => (_jsxs("div", { className: "credential-item", children: [_jsxs("div", { className: "credential-info", children: [_jsx("div", { className: "credential-name", children: cred.name }), _jsx("div", { className: "credential-username", children: cred.username })] }), _jsxs("div", { className: "credential-actions", children: [_jsx("button", { className: "icon-btn", title: "Copy username", onClick: () => handleCopy(cred.username, 'Username'), children: "\uD83D\uDC64" }), _jsx("button", { className: "icon-btn", title: "Copy password", onClick: () => handleCopy('[password]', 'Password'), children: "\uD83D\uDD11" }), _jsx("button", { className: "btn-fill", onClick: () => handleFill(cred), children: "Fill" })] })] }, cred.id)))) })] })), activeTab === 'generator' && (_jsxs("div", { className: "generator-tab", children: [_jsxs("div", { className: "password-display", children: [_jsx("span", { className: "password-text", children: password || 'Generate a password' }), _jsxs("div", { className: "password-actions", children: [_jsx("button", { className: "icon-btn", onClick: () => handleCopy(password, 'Password'), title: "Copy", children: "\uD83D\uDCCB" }), _jsx("button", { className: "icon-btn", onClick: generatePassword, title: "Regenerate", children: "\uD83D\uDD04" })] })] }), _jsxs("div", { className: "strength-bar", children: [_jsx("div", { className: "strength-segments", children: [0, 1, 2, 3, 4].map((i) => (_jsx("div", { className: "strength-segment", style: {
                                                backgroundColor: i < getPasswordStrength() ? getStrengthColor() : '#334155'
                                            } }, i))) }), _jsx("span", { className: "strength-label", style: { color: getStrengthColor() }, children: getStrengthLabel() })] }), _jsxs("div", { className: "option-row", children: [_jsxs("span", { children: ["Length: ", length] }), _jsx("input", { type: "range", min: "8", max: "32", value: length, onChange: (e) => setLength(parseInt(e.target.value)), className: "slider" })] }), _jsxs("div", { className: "options-grid", children: [_jsxs("label", { className: "option-toggle", children: [_jsx("input", { type: "checkbox", checked: options.uppercase, onChange: (e) => setOptions({ ...options, uppercase: e.target.checked }) }), _jsx("span", { children: "A-Z" })] }), _jsxs("label", { className: "option-toggle", children: [_jsx("input", { type: "checkbox", checked: options.lowercase, onChange: (e) => setOptions({ ...options, lowercase: e.target.checked }) }), _jsx("span", { children: "a-z" })] }), _jsxs("label", { className: "option-toggle", children: [_jsx("input", { type: "checkbox", checked: options.numbers, onChange: (e) => setOptions({ ...options, numbers: e.target.checked }) }), _jsx("span", { children: "0-9" })] }), _jsxs("label", { className: "option-toggle", children: [_jsx("input", { type: "checkbox", checked: options.symbols, onChange: (e) => setOptions({ ...options, symbols: e.target.checked }) }), _jsx("span", { children: "!@#" })] })] })] }))] }), _jsxs("div", { className: "popup-footer", children: [_jsxs("span", { className: "footer-status", children: [_jsx("span", { className: "status-dot connected" }), " Connected"] }), _jsx("a", { href: "#", className: "footer-link", onClick: (e) => { e.preventDefault(); openDesktopApp(); }, children: "\uD83D\uDD12 Lock" })] })] }));
}
// Mount
const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(_jsx(Popup, {}));
}
//# sourceMappingURL=popup.js.map