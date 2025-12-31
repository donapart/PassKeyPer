import React, { useState, useEffect } from 'react'
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Fingerprint, RefreshCcw, ExternalLink } from 'lucide-react'
import { useAppStore } from '../store/app-store'
import { decrypt, initCrypto } from '@passkeyper/core'
import { toast } from './Toast'

interface SecurityAuditModalProps {
    isOpen: boolean
    onClose: () => void
}

interface AuditIssue {
    itemId: string
    itemName: string
    type: 'weak' | 'reused' | 'leaked'
    severity: 'low' | 'medium' | 'high'
    description: string
}

export function SecurityAuditModal({ isOpen, onClose }: SecurityAuditModalProps) {
    const { items, encryptionKey, currentVault } = useAppStore()
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [issues, setIssues] = useState<AuditIssue[]>([])
    const [score, setScore] = useState(100)
    const [stats, setStats] = useState({
        total: 0,
        weak: 0,
        reused: 0,
        leaked: 0
    })

    const checkPwnedPassword = async (password: string): Promise<number> => {
        try {
            const msgUint8 = new TextEncoder().encode(password)
            const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()

            const prefix = hashHex.slice(0, 5)
            const suffix = hashHex.slice(5)

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
            if (!response.ok) return 0

            const content = await response.text()
            const lines = content.split('\n')

            for (const line of lines) {
                const [lineSuffix, count] = line.split(':')
                if (lineSuffix.trim() === suffix) {
                    return parseInt(count.trim(), 10)
                }
            }
            return 0
        } catch (e) {
            console.error('Pwned check failed', e)
            return 0
        }
    }

    const runAudit = async () => {
        if (!items || items.length === 0 || !encryptionKey) return

        setIsAnalyzing(true)
        setIssues([])

        try {
            await initCrypto()
            const decryptedItems: any[] = []

            for (const item of items) {
                try {
                    const decryptedJson = await decrypt(item.encryptedData, encryptionKey)
                    const data = JSON.parse(decryptedJson)
                    decryptedItems.push({
                        ...item,
                        decryptedData: data
                    })
                } catch (e) {
                    console.error(`Failed to decrypt item ${item.id}`, e)
                }
            }

            const foundIssues: AuditIssue[] = []
            const passwordMap = new Map<string, string[]>()

            for (const item of decryptedItems) {
                const password = item.decryptedData.password
                if (!password) continue

                if (password.length < 12) {
                    foundIssues.push({
                        itemId: item.id,
                        itemName: item.decryptedData.name || 'Unnamed Item',
                        type: 'weak',
                        severity: 'high',
                        description: `Password is too short (${password.length} chars). Minimum recommended is 12.`
                    })
                }

                if (passwordMap.has(password)) {
                    passwordMap.get(password)?.push(item.decryptedData.name || 'Unnamed Item')
                } else {
                    passwordMap.set(password, [item.decryptedData.name || 'Unnamed Item'])
                }

                const pwnCount = await checkPwnedPassword(password)
                if (pwnCount > 0) {
                    foundIssues.push({
                        itemId: item.id,
                        itemName: item.decryptedData.name || 'Unnamed Item',
                        type: 'leaked',
                        severity: 'high',
                        description: `This password was found in a data breach! It appeared ${pwnCount.toLocaleString()} times.`
                    })
                }
            }

            passwordMap.forEach((names, password) => {
                if (names.length > 1) {
                    const sharedItems = decryptedItems.filter(i => i.decryptedData.password === password)
                    sharedItems.forEach(item => {
                        foundIssues.push({
                            itemId: item.id,
                            itemName: item.decryptedData.name || 'Unnamed Item',
                            type: 'reused',
                            severity: 'medium',
                            description: `Password used in ${names.length} items: ${names.filter(n => n !== (item.decryptedData.name || 'Unnamed Item')).join(', ')}`
                        })
                    })
                }
            })

            setIssues(foundIssues)
            const deduplicatedIssueCount = new Set(foundIssues.map(i => i.itemId)).size
            const newScore = Math.max(0, 100 - (deduplicatedIssueCount * 10))
            setScore(newScore)

            setStats({
                total: items.length,
                weak: foundIssues.filter(i => i.type === 'weak').length,
                reused: foundIssues.filter(i => i.type === 'reused').length,
                leaked: foundIssues.filter(i => i.type === 'leaked').length
            })

        } catch (error) {
            toast.error('Audit failed')
        } finally {
            setIsAnalyzing(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            runAudit()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-2xl animate-slideUp overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-dark-700 to-dark-800 p-6 border-b border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center border border-primary-500/30">
                            <ShieldAlert className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Security Audit</h2>
                            <p className="text-dark-400 text-xs">Analyzing {currentVault?.name || 'Vault'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-8">
                    <div className="flex items-center gap-8 bg-dark-900/40 p-6 rounded-2xl border border-dark-700/50">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-dark-700"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={251}
                                    strokeDashoffset={251 - (251 * score) / 100}
                                    className={`${score > 80 ? 'text-green-500' : score > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`}
                                />
                            </svg>
                            <span className="absolute text-2xl font-black text-white">{score}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-dark-500 uppercase font-bold mb-1">Total</p>
                                <p className="text-xl font-bold text-white">{stats.total}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-red-500 uppercase font-bold mb-1">Weak</p>
                                <p className="text-xl font-bold text-white">{stats.weak}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-amber-500 uppercase font-bold mb-1">Reused</p>
                                <p className="text-xl font-bold text-white">{stats.reused}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-primary-500 uppercase font-bold mb-1">Leaked</p>
                                <p className="text-xl font-bold text-white">{stats.leaked}</p>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest">Active Alerts</h3>
                            <button
                                onClick={runAudit}
                                disabled={isAnalyzing}
                                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5 font-bold transition-colors"
                            >
                                <RefreshCcw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                Re-analyze
                            </button>
                        </div>

                        {issues.length === 0 && !isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700">
                                <CheckCircle2 className="w-12 h-12 text-green-500/30 mb-4" />
                                <h4 className="text-white font-bold mb-1">Security looking good!</h4>
                                <p className="text-xs text-dark-400">No major vulnerabilities found in this vault.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {issues.map((issue, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-700/50 group hover:border-dark-600 transition-colors">
                                        <div className={`p-2 rounded-lg ${issue.type === 'weak' ? 'bg-red-500/10 text-red-400' :
                                                issue.type === 'reused' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {issue.type === 'leaked' ? <Fingerprint className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-white text-sm truncate">{issue.itemName}</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${issue.severity === 'high' ? 'bg-red-900/30 text-red-500' :
                                                        issue.severity === 'medium' ? 'bg-amber-900/30 text-amber-500' :
                                                            'bg-blue-900/30 text-blue-500'
                                                    }`}>
                                                    {issue.severity} priority
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark-400 leading-relaxed">{issue.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-6 border-t border-dark-700 bg-dark-800/50">
                    <button
                        onClick={onClose}
                        className="btn-primary w-full shadow-lg shadow-primary-900/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
