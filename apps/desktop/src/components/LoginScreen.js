import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import pkpLogo from '../assets/pkp_logo.png';
import { Lock, Mail, Eye, EyeOff, LogIn, Shield, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store/app-store';
export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const { setUser, setIsLocked } = useAppStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isSignup) {
                // Create account
                const result = await window.electronAPI.createAccount(email, password);
                if (result.success) {
                    setUser({ email, salt: result.salt });
                    setIsLocked(false);
                    // Save salt to localStorage for next login
                    localStorage.setItem('user_email', email);
                    localStorage.setItem('user_salt', result.salt);
                }
                else {
                    setError(result.error || 'Failed to create account');
                }
            }
            else {
                // Login
                const salt = localStorage.getItem('user_salt');
                if (!salt) {
                    setError('Account not found. Please create an account first.');
                    setIsLoading(false);
                    return;
                }
                const result = await window.electronAPI.login(email, password, salt);
                if (result.twoFactorRequired) {
                    setShow2FA(true);
                    setTempEmail(email);
                    setIsLoading(false);
                    return;
                }
                if (result.success) {
                    if (result.token) {
                        localStorage.setItem('auth_token', result.token);
                    }
                    setUser({
                        email,
                        salt,
                        twoFactorEnabled: result.user?.twoFactorEnabled || false
                    });
                    setIsLocked(false);
                }
                else {
                    setError(result.error || 'Invalid credentials');
                }
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handle2FAVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await window.electronAPI.verify2FA({
                email: tempEmail,
                code: twoFactorCode
            });
            if (result.token) {
                localStorage.setItem('auth_token', result.token);
                const salt = localStorage.getItem('user_salt') || '';
                setUser({
                    email: tempEmail,
                    salt,
                    twoFactorEnabled: true
                });
                setIsLocked(false);
            }
            else {
                setError(result.error || 'Invalid 2FA code');
            }
        }
        catch (err) {
            setError(err.message || 'Verification failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "mb-6", children: _jsx("img", { src: pkpLogo, alt: "PassKeyPer", className: "w-24 h-24 rounded-2xl mx-auto shadow-2xl shadow-primary-500/20" }) }), _jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "PassKeyPer" }), _jsx("p", { className: "text-dark-400", children: isSignup ? 'Create your secure vault' : 'Welcome back' })] }), _jsx("div", { className: "card animate-slideUp", children: show2FA ? (_jsxs("form", { onSubmit: handle2FAVerify, className: "space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30", children: _jsx(Shield, { className: "w-8 h-8 text-primary-400" }) }), _jsx("h2", { className: "text-xl font-bold text-white", children: "Two-Factor Auth" }), _jsx("p", { className: "text-sm text-dark-400", children: "Enter the code from your app or a recovery code" })] }), _jsxs("div", { children: [_jsx("input", { type: "text", maxLength: 10, value: twoFactorCode, onChange: (e) => setTwoFactorCode(e.target.value.toUpperCase().replace(/[^A-Z0-0]/g, '')), className: "input w-full text-3xl text-center font-mono tracking-[0.2em] py-4 bg-dark-900 border-primary-500/30 focus:border-primary-500", placeholder: "000000", required: true, autoFocus: true }), _jsx("p", { className: "mt-2 text-[10px] text-center text-dark-400 italic", children: "Lost your device? You can use one of your 10-character recovery codes here." })] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm text-center", children: error })), _jsx("button", { type: "submit", disabled: isLoading || (twoFactorCode.length !== 6 && twoFactorCode.length !== 10), className: "btn-primary w-full py-4 font-bold text-lg shadow-lg shadow-primary-900/20", children: isLoading ? 'Verifying...' : 'Verify & Unlock' }), _jsxs("button", { type: "button", onClick: () => {
                                    setShow2FA(false);
                                    setTwoFactorCode('');
                                    setError('');
                                }, className: "w-full flex items-center justify-center gap-2 text-sm text-dark-400 hover:text-white transition-colors", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Back to login"] })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input pl-11 w-full", placeholder: "your@email.com", required: true, autoFocus: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Master Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "input pl-11 pr-11 w-full", placeholder: "Enter your master password", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-gray-300", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] }), isSignup && (_jsx("p", { className: "mt-2 text-xs text-dark-400", children: "Choose a strong master password. You won't be able to recover it if you forget!" }))] }), error && (_jsx("div", { className: "bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm", children: error })), _jsxs("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full flex items-center justify-center gap-2", children: [_jsx(LogIn, { className: "w-5 h-5" }), isLoading ? 'Please wait...' : isSignup ? 'Create Account' : 'Unlock Vault'] }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => {
                                        setIsSignup(!isSignup);
                                        setError('');
                                    }, className: "text-sm text-primary-400 hover:text-primary-300", children: isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up" }) })] })) }), _jsx("div", { className: "mt-6 text-center text-xs text-dark-500", children: _jsx("p", { children: "\uD83D\uDD12 Zero-knowledge encryption \u00B7 Your data, your keys" }) })] }) }));
}
//# sourceMappingURL=LoginScreen.js.map