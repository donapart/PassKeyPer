import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Shield, Smartphone, Copy, Check, ChevronRight, AlertCircle, Trash2, Download } from 'lucide-react';
import { toast } from './Toast';
export function TwoFactorSetupModal({ isOpen, onClose, onSuccess, isAlreadyEnabled }) {
    const [step, setStep] = useState(isAlreadyEnabled ? 'disable' : 'instructions');
    const [setupData, setSetupData] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const handleStartSetup = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            const result = await window.electronAPI.setup2FA(token);
            setSetupData(result);
            setStep('scan');
        }
        catch (error) {
            toast.error(error.message || 'Failed to initialize 2FA setup');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleEnable = async () => {
        if (!setupData || code.length !== 6)
            return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            const result = await window.electronAPI.enable2FA({ secret: setupData.secret, code }, token);
            if (result.recoveryCodes) {
                setRecoveryCodes(result.recoveryCodes);
                setStep('recovery');
                toast.success('2FA enabled! Please save your recovery codes.');
            }
            else {
                toast.success('Two-factor authentication enabled successfully');
                onSuccess();
                onClose();
            }
        }
        catch (error) {
            toast.error(error.message || 'Verification failed');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDisable = async () => {
        if (code.length !== 6)
            return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token') || '';
            await window.electronAPI.disable2FA({ code }, token);
            toast.success('Two-factor authentication disabled');
            onSuccess();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to disable 2FA');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const copySecret = () => {
        if (!setupData)
            return;
        navigator.clipboard.writeText(setupData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const downloadRecoveryCodes = () => {
        const content = `PassKeyPer - 2FA Recovery Codes\nGenerated on: ${new Date().toLocaleString()}\n\n${recoveryCodes.join('\n')}\n\nKeep these codes in a safe place! Use them to log in if you lose your 2FA device.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passkeyper-recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        toast.success('Recovery codes copied to clipboard');
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-md animate-slideUp overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-dark-700 flex items-center justify-between bg-dark-900/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center border ${step === 'disable' ? 'bg-red-900/20 border-red-500/30' :
                                        step === 'recovery' ? 'bg-green-600/20 border-green-500/30' :
                                            'bg-primary-600/20 border-primary-500/30'}`, children: _jsx(Shield, { className: `w-5 h-5 ${step === 'disable' ? 'text-red-400' :
                                            step === 'recovery' ? 'text-green-400' :
                                                'text-primary-400'}` }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: step === 'disable' ? 'Disable 2FA' :
                                                step === 'recovery' ? 'Recovery Codes' :
                                                    'Two-Factor Authentication' }), _jsx("p", { className: "text-dark-400 text-xs", children: "Secure your account with TOTP" })] })] }), _jsx("button", { onClick: onClose, className: "text-dark-400 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-8", children: [step === 'instructions' && (_jsxs("div", { className: "space-y-6 text-center", children: [_jsx("div", { className: "w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mx-auto mb-2 text-primary-400", children: _jsx(Smartphone, { className: "w-10 h-10" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Enhance your security" }), _jsx("p", { className: "text-sm text-dark-400 leading-relaxed", children: "Add an extra layer of protection to your account. When enabled, you'll need a code from your authenticator app to log in." })] }), _jsxs("button", { onClick: handleStartSetup, disabled: isSubmitting, className: "btn-primary w-full py-3 flex items-center justify-center gap-2 group", children: ["Get Started", _jsx(ChevronRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })] })] })), step === 'scan' && setupData && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-dark-300 mb-4", children: "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)" }), _jsx("div", { className: "bg-white p-3 rounded-xl inline-block shadow-2xl", children: _jsx("img", { src: setupData.qrCodeUrl, alt: "QR Code", className: "w-48 h-48" }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-[10px] font-bold text-dark-500 uppercase tracking-widest", children: "Or enter secret manually" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("code", { className: "flex-1 bg-dark-900 border border-dark-700 rounded-lg py-2 px-3 text-sm text-primary-400 font-mono flex items-center justify-center tracking-widest overflow-hidden text-ellipsis", children: setupData.secret }), _jsx("button", { onClick: copySecret, className: "btn-secondary px-3", title: "Copy Secret", children: copied ? _jsx(Check, { className: "w-4 h-4 text-green-500" }) : _jsx(Copy, { className: "w-4 h-4" }) })] })] }), _jsx("div", { className: "pt-4", children: _jsx("button", { onClick: () => setStep('verify'), className: "btn-primary w-full py-3", children: "Continue" }) })] })), step === 'verify' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/20", children: _jsx(Check, { className: "w-8 h-8 text-primary-400" }) }), _jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Verify Setup" }), _jsx("p", { className: "text-sm text-dark-400", children: "Enter the 6-digit code from your app to confirm." })] }), _jsx("input", { type: "text", maxLength: 6, placeholder: "000 000", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '')), className: "input w-full text-4xl text-center font-mono tracking-[0.5em] py-4 bg-dark-900 border-primary-500/30 focus:border-primary-500", autoFocus: true }), _jsx("button", { onClick: handleEnable, disabled: code.length !== 6 || isSubmitting, className: "btn-primary w-full py-3", children: isSubmitting ? 'Verifying...' : 'Enable 2FA' }), _jsx("button", { onClick: () => setStep('scan'), className: "btn-ghost w-full", children: "Back to QR Code" })] })), step === 'recovery' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-amber-900/10 border border-amber-900/30 rounded-xl p-4 flex gap-3 text-amber-200", children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }), _jsxs("p", { className: "text-xs leading-relaxed", children: [_jsx("strong", { children: "Save these codes!" }), " If you lose your 2FA device, these are the ONLY way to access your account."] })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 bg-dark-900 p-4 rounded-xl border border-dark-700", children: recoveryCodes.map((c, i) => (_jsx("code", { className: "text-xs font-mono text-primary-400 p-1", children: c }, i))) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: copyRecoveryCodes, className: "btn-secondary flex-1 flex items-center justify-center gap-2 text-xs py-2", children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy"] }), _jsxs("button", { onClick: downloadRecoveryCodes, className: "btn-secondary flex-1 flex items-center justify-center gap-2 text-xs py-2", children: [_jsx(Download, { className: "w-4 h-4" }), "Download"] })] }), _jsx("button", { onClick: () => {
                                        onSuccess();
                                        onClose();
                                    }, className: "btn-primary w-full py-3", children: "I have saved these codes" })] })), step === 'disable' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex gap-3 text-red-200", children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0" }), _jsx("p", { className: "text-xs leading-relaxed", children: "Disabling 2FA will reduce your account security. Please enter your current code to confirm." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "text", maxLength: 6, placeholder: "000 000", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '')), className: "input w-full text-3xl text-center font-mono tracking-[0.5em] py-4", autoFocus: true }), _jsxs("button", { onClick: handleDisable, disabled: code.length !== 6 || isSubmitting, className: "bg-red-600 hover:bg-red-700 text-white font-bold w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Disable 2FA"] })] })] }))] })] }) }));
}
//# sourceMappingURL=TwoFactorSetupModal.js.map