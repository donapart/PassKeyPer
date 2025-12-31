import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Fingerprint, RefreshCcw } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { decrypt, initCrypto } from '@passkeyper/core';
import { toast } from './Toast';
export function SecurityAuditModal({ isOpen, onClose }) {
    const { items, encryptionKey, currentVault } = useAppStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [issues, setIssues] = useState([]);
    const [score, setScore] = useState(100);
    const [stats, setStats] = useState({
        total: 0,
        weak: 0,
        reused: 0,
        leaked: 0
    });
    const checkPwnedPassword = async (password) => {
        try {
            const msgUint8 = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            const prefix = hashHex.slice(0, 5);
            const suffix = hashHex.slice(5);
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok)
                return 0;
            const content = await response.text();
            const lines = content.split('\n');
            for (const line of lines) {
                const [lineSuffix, count] = line.split(':');
                if (lineSuffix.trim() === suffix) {
                    return parseInt(count.trim(), 10);
                }
            }
            return 0;
        }
        catch (e) {
            console.error('Pwned check failed', e);
            return 0;
        }
    };
    const runAudit = async () => {
        if (!items || items.length === 0 || !encryptionKey)
            return;
        setIsAnalyzing(true);
        setIssues([]);
        try {
            await initCrypto();
            const decryptedItems = [];
            for (const item of items) {
                try {
                    const decryptedJson = await decrypt(item.encryptedData, encryptionKey);
                    const data = JSON.parse(decryptedJson);
                    decryptedItems.push({
                        ...item,
                        decryptedData: data
                    });
                }
                catch (e) {
                    console.error(`Failed to decrypt item ${item.id}`, e);
                }
            }
            const foundIssues = [];
            const passwordMap = new Map();
            for (const item of decryptedItems) {
                const password = item.decryptedData.password;
                if (!password)
                    continue;
                if (password.length < 12) {
                    foundIssues.push({
                        itemId: item.id,
                        itemName: item.decryptedData.name || 'Unnamed Item',
                        type: 'weak',
                        severity: 'high',
                        description: `Password is too short (${password.length} chars). Minimum recommended is 12.`
                    });
                }
                if (passwordMap.has(password)) {
                    passwordMap.get(password)?.push(item.decryptedData.name || 'Unnamed Item');
                }
                else {
                    passwordMap.set(password, [item.decryptedData.name || 'Unnamed Item']);
                }
                const pwnCount = await checkPwnedPassword(password);
                if (pwnCount > 0) {
                    foundIssues.push({
                        itemId: item.id,
                        itemName: item.decryptedData.name || 'Unnamed Item',
                        type: 'leaked',
                        severity: 'high',
                        description: `This password was found in a data breach! It appeared ${pwnCount.toLocaleString()} times.`
                    });
                }
            }
            passwordMap.forEach((names, password) => {
                if (names.length > 1) {
                    const sharedItems = decryptedItems.filter(i => i.decryptedData.password === password);
                    sharedItems.forEach(item => {
                        foundIssues.push({
                            itemId: item.id,
                            itemName: item.decryptedData.name || 'Unnamed Item',
                            type: 'reused',
                            severity: 'medium',
                            description: `Password used in ${names.length} items: ${names.filter(n => n !== (item.decryptedData.name || 'Unnamed Item')).join(', ')}`
                        });
                    });
                }
            });
            setIssues(foundIssues);
            const deduplicatedIssueCount = new Set(foundIssues.map(i => i.itemId)).size;
            const newScore = Math.max(0, 100 - (deduplicatedIssueCount * 10));
            setScore(newScore);
            setStats({
                total: items.length,
                weak: foundIssues.filter(i => i.type === 'weak').length,
                reused: foundIssues.filter(i => i.type === 'reused').length,
                leaked: foundIssues.filter(i => i.type === 'leaked').length
            });
        }
        catch (error) {
            toast.error('Audit failed');
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            runAudit();
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl animate-slideUp overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "bg-gradient-to-r from-dark-700 to-dark-800 p-6 border-b border-dark-700 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center border border-primary-500/30", children: _jsx(ShieldAlert, { className: "w-5 h-5 text-primary-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Security Audit" }), _jsxs("p", { className: "text-dark-400 text-xs", children: ["Analyzing ", currentVault?.name || 'Vault'] })] })] }), _jsx("button", { onClick: onClose, className: "text-dark-400 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-8", children: [_jsxs("div", { className: "flex items-center gap-8 bg-dark-900/40 p-6 rounded-2xl border border-dark-700/50", children: [_jsxs("div", { className: "relative w-24 h-24 flex items-center justify-center", children: [_jsxs("svg", { className: "w-full h-full -rotate-90", children: [_jsx("circle", { cx: "48", cy: "48", r: "40", fill: "transparent", stroke: "currentColor", strokeWidth: "8", className: "text-dark-700" }), _jsx("circle", { cx: "48", cy: "48", r: "40", fill: "transparent", stroke: "currentColor", strokeWidth: "8", strokeDasharray: 251, strokeDashoffset: 251 - (251 * score) / 100, className: `${score > 80 ? 'text-green-500' : score > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000` })] }), _jsx("span", { className: "absolute text-2xl font-black text-white", children: score })] }), _jsxs("div", { className: "flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-dark-500 uppercase font-bold mb-1", children: "Total" }), _jsx("p", { className: "text-xl font-bold text-white", children: stats.total })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-red-500 uppercase font-bold mb-1", children: "Weak" }), _jsx("p", { className: "text-xl font-bold text-white", children: stats.weak })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-amber-500 uppercase font-bold mb-1", children: "Reused" }), _jsx("p", { className: "text-xl font-bold text-white", children: stats.reused })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-primary-500 uppercase font-bold mb-1", children: "Leaked" }), _jsx("p", { className: "text-xl font-bold text-white", children: stats.leaked })] })] })] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-bold text-dark-400 uppercase tracking-widest", children: "Active Alerts" }), _jsxs("button", { onClick: runAudit, disabled: isAnalyzing, className: "text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5 font-bold transition-colors", children: [_jsx(RefreshCcw, { className: `w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}` }), "Re-analyze"] })] }), issues.length === 0 && !isAnalyzing ? (_jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700", children: [_jsx(CheckCircle2, { className: "w-12 h-12 text-green-500/30 mb-4" }), _jsx("h4", { className: "text-white font-bold mb-1", children: "Security looking good!" }), _jsx("p", { className: "text-xs text-dark-400", children: "No major vulnerabilities found in this vault." })] })) : (_jsx("div", { className: "space-y-3", children: issues.map((issue, idx) => (_jsxs("div", { className: "flex items-start gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-700/50 group hover:border-dark-600 transition-colors", children: [_jsx("div", { className: `p-2 rounded-lg ${issue.type === 'weak' ? 'bg-red-500/10 text-red-400' :
                                                    issue.type === 'reused' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-purple-500/10 text-purple-400'}`, children: issue.type === 'leaked' ? _jsx(Fingerprint, { className: "w-4 h-4" }) : _jsx(ShieldAlert, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "font-bold text-white text-sm truncate", children: issue.itemName }), _jsxs("span", { className: `text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${issue.severity === 'high' ? 'bg-red-900/30 text-red-500' :
                                                                    issue.severity === 'medium' ? 'bg-amber-900/30 text-amber-500' :
                                                                        'bg-blue-900/30 text-blue-500'}`, children: [issue.severity, " priority"] })] }), _jsx("p", { className: "text-xs text-dark-400 leading-relaxed", children: issue.description })] })] }, idx))) }))] })] }), _jsx("div", { className: "p-6 border-t border-dark-700 bg-dark-800/50", children: _jsx("button", { onClick: onClose, className: "btn-primary w-full shadow-lg shadow-primary-900/20", children: "Done" }) })] }) }));
}
//# sourceMappingURL=SecurityAuditModal.js.map