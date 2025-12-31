import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TOTP Display Component
 * Shows TOTP code with countdown timer
 */
import { useEffect, useState } from 'react';
import { Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { generateTOTP } from '@passkeyper/totp';
export function TOTPDisplay({ config, onCopy }) {
    const [token, setToken] = useState(null);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        // Generate initial token
        updateToken();
        // Update every second
        const interval = setInterval(updateToken, 1000);
        return () => clearInterval(interval);
    }, [config]);
    const updateToken = () => {
        const newToken = generateTOTP(config);
        setToken(newToken);
    };
    const handleCopy = async () => {
        if (!token)
            return;
        await navigator.clipboard.writeText(token.token);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
    };
    if (!token) {
        return (_jsxs("div", { className: "totp-loading", children: [_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "Generating code..." })] }));
    }
    // Format token: 123 456
    const formattedToken = token.token.replace(/(\d{3})(\d{3})/, '$1 $2');
    // Progress percentage
    const progress = ((config.period || 30) - token.remainingTime) / (config.period || 30) * 100;
    // Color based on remaining time
    const getColor = () => {
        if (token.remainingTime <= 5)
            return 'text-red-400';
        if (token.remainingTime <= 10)
            return 'text-yellow-400';
        return 'text-green-400';
    };
    return (_jsxs("div", { className: "totp-container", children: [_jsxs("div", { className: "totp-code-wrapper", children: [_jsx("div", { className: `totp-code ${getColor()}`, children: formattedToken }), _jsx("button", { onClick: handleCopy, className: "totp-copy-btn", title: "Copy code", children: copied ? (_jsx(Check, { className: "w-4 h-4 text-green-400" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] }), _jsxs("div", { className: "totp-timer", children: [_jsxs("div", { className: "timer-info", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { className: getColor(), children: [token.remainingTime, "s"] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: {
                                width: `${progress}%`,
                                backgroundColor: token.remainingTime <= 5 ? '#f87171' :
                                    token.remainingTime <= 10 ? '#fbbf24' : '#4ade80'
                            } }) })] }), config.issuer && (_jsx("div", { className: "totp-issuer", children: config.issuer }))] }));
}
export function TOTPSetup({ onAdd, onCancel }) {
    const [secret, setSecret] = useState('');
    const [issuer, setIssuer] = useState('');
    const [uri, setUri] = useState('');
    const [error, setError] = useState('');
    const handleAddManual = () => {
        if (!secret) {
            setError('Secret is required');
            return;
        }
        onAdd({
            secret,
            issuer: issuer || undefined,
        });
    };
    const handleAddFromUri = () => {
        if (!uri) {
            setError('URI is required');
            return;
        }
        try {
            // Basic otpauth URI parsing
            // otpauth://totp/Issuer:Email?secret=SECRET&issuer=Issuer&period=30
            if (!uri.startsWith('otpauth://totp/')) {
                throw new Error('Not a valid TOTP URI');
            }
            const urlParts = uri.split('?');
            const pathParts = urlParts[0].split('/');
            const label = decodeURIComponent(pathParts[pathParts.length - 1]);
            const params = new URLSearchParams(urlParts[1]);
            const secretParam = params.get('secret');
            const issuerParam = params.get('issuer') || label.split(':')[0];
            const periodParam = params.get('period');
            const digitsParam = params.get('digits');
            if (!secretParam) {
                throw new Error('Secret parameter missing in URI');
            }
            onAdd({
                secret: secretParam,
                issuer: issuerParam || undefined,
                period: periodParam ? parseInt(periodParam) : undefined,
                digits: digitsParam ? parseInt(digitsParam) : undefined
            });
            setError('');
            setUri('');
        }
        catch (err) {
            setError(err.message || 'Invalid TOTP URI');
        }
    };
    return (_jsxs("div", { className: "totp-setup", children: [_jsx("h3", { children: "Add TOTP Authenticator" }), _jsxs("div", { className: "setup-section", children: [_jsx("label", { className: "label", children: "Secret Key" }), _jsx("input", { type: "text", value: secret, onChange: (e) => setSecret(e.target.value), placeholder: "Enter secret key (base32)", className: "input" })] }), _jsxs("div", { className: "setup-section", children: [_jsx("label", { className: "label", children: "Issuer (optional)" }), _jsx("input", { type: "text", value: issuer, onChange: (e) => setIssuer(e.target.value), placeholder: "e.g., Google, GitHub", className: "input" })] }), _jsx("div", { className: "divider", children: "OR" }), _jsxs("div", { className: "setup-section", children: [_jsx("label", { className: "label", children: "TOTP URI" }), _jsx("input", { type: "text", value: uri, onChange: (e) => setUri(e.target.value), placeholder: "otpauth://totp/...", className: "input" })] }), _jsx("div", { className: "setup-section", children: _jsx("button", { className: "btn-secondary", disabled: true, children: "\uD83D\uDCF7 Scan QR Code (Coming Soon)" }) }), error && (_jsx("div", { className: "error-message", children: error })), _jsxs("div", { className: "setup-actions", children: [_jsx("button", { onClick: onCancel, className: "btn-ghost", children: "Cancel" }), _jsx("button", { onClick: handleAddManual, className: "btn-primary", children: "Add TOTP" })] })] }));
}
//# sourceMappingURL=TOTPDisplay.js.map