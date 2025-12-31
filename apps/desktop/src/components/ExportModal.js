import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Export Modal Component
 * Allows exporting passwords to CSV or JSON
 */
import { useState } from 'react';
import { X, Download, Lock, Unlock } from 'lucide-react';
import { exportToCSV, exportToJSON } from '@passkeyper/io';
import { useToast } from '../hooks/useToast';
export function ExportModal({ isOpen, onClose, items }) {
    const [format, setFormat] = useState('csv');
    const [encrypt, setEncrypt] = useState(true);
    const [password, setPassword] = useState('');
    const [exporting, setExporting] = useState(false);
    const { toast } = useToast();
    if (!isOpen)
        return null;
    const handleExport = async () => {
        if (items.length === 0) {
            toast({ type: 'error', message: 'No items to export' });
            return;
        }
        if (format === 'json' && encrypt && !password) {
            toast({ type: 'error', message: 'Please enter an encryption password' });
            return;
        }
        setExporting(true);
        try {
            let content;
            let filename;
            if (format === 'csv') {
                content = exportToCSV(items);
                filename = `passkeyper-export-${Date.now()}.csv`;
            }
            else {
                // JSON export
                let encryptionKey;
                if (encrypt && password) {
                    // Derive key from password (simple for export, could be improved)
                    const encoder = new TextEncoder();
                    const passwordBytes = encoder.encode(password);
                    // Simple key derivation (should use proper KDF in production)
                    encryptionKey = new Uint8Array(32);
                    for (let i = 0; i < Math.min(passwordBytes.length, 32); i++) {
                        encryptionKey[i] = passwordBytes[i];
                    }
                }
                content = await exportToJSON(items, encryptionKey);
                filename = `passkeyper-export-${Date.now()}.json`;
            }
            // Download file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            toast({
                type: 'success',
                message: `Exported ${items.length} items to ${filename}`
            });
            onClose();
        }
        catch (error) {
            toast({
                type: 'error',
                message: `Export failed: ${error.message}`
            });
        }
        finally {
            setExporting(false);
        }
    };
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", style: { maxWidth: '500px' }, children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Export Passwords" }), _jsx("button", { onClick: onClose, className: "modal-close", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium mb-3", children: "Export Format" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors", children: [_jsx("input", { type: "radio", name: "format", value: "csv", checked: format === 'csv', onChange: (e) => setFormat('csv'), className: "radio" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: "CSV (Comma-Separated)" }), _jsx("div", { className: "text-sm text-gray-400", children: "Standard format, compatible with most password managers" })] })] }), _jsxs("label", { className: "flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors", children: [_jsx("input", { type: "radio", name: "format", value: "json", checked: format === 'json', onChange: (e) => setFormat('json'), className: "radio" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: "JSON (Encrypted)" }), _jsx("div", { className: "text-sm text-gray-400", children: "PassKeyPer native format with optional encryption" })] })] })] })] }), format === 'json' && (_jsxs("div", { className: "mb-6", children: [_jsxs("label", { className: "flex items-center gap-3 p-4 bg-slate-800 rounded-lg cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: encrypt, onChange: (e) => setEncrypt(e.target.checked), className: "checkbox" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [encrypt ? (_jsx(Lock, { className: "w-4 h-4 text-green-400" })) : (_jsx(Unlock, { className: "w-4 h-4 text-yellow-400" })), _jsx("span", { className: "font-medium", children: "Encrypt export file" })] }), _jsx("div", { className: "text-sm text-gray-400 mt-1", children: encrypt
                                                        ? 'Recommended: Protects your data with AES-256-GCM'
                                                        : 'Warning: Export will be unencrypted (plain text)' })] })] }), encrypt && (_jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Encryption Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter a strong password", className: "input w-full", autoFocus: true }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "You'll need this password to import the file later" })] }))] })), _jsx("div", { className: "mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Lock, { className: "w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-medium text-yellow-400 mb-1", children: "Security Warning" }), _jsx("div", { className: "text-gray-300", children: format === 'csv' ? (_jsxs(_Fragment, { children: ["CSV format stores passwords in ", _jsx("strong", { children: "plain text" }), ". Keep the file secure and delete it after importing elsewhere."] })) : encrypt ? (_jsx(_Fragment, { children: "Make sure to remember your encryption password. Without it, you won't be able to import the file." })) : (_jsxs(_Fragment, { children: ["Unencrypted JSON export stores passwords in ", _jsx("strong", { children: "plain text" }), ". We recommend enabling encryption."] })) })] })] }) }), _jsxs("div", { className: "mb-6 p-3 bg-slate-800 rounded-lg text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-400", children: items.length }), _jsx("div", { className: "text-sm text-gray-400", children: "items will be exported" })] }), _jsxs("button", { onClick: handleExport, disabled: exporting || (format === 'json' && encrypt && !password), className: "btn-primary w-full flex items-center justify-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`] })] })] }) }));
}
//# sourceMappingURL=ExportModal.js.map