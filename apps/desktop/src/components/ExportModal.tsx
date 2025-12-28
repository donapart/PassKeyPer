/**
 * Export Modal Component
 * Allows exporting passwords to CSV or JSON
 */

import React, { useState } from 'react'
import { X, Download, Lock, Unlock } from 'lucide-react'
import { exportToCSV, exportToJSON } from '@passkeyper/io'
import type { VaultItem } from '@passkeyper/core'
import { useToast } from '../hooks/useToast'

interface ExportModalProps {
    isOpen: boolean
    onClose: () => void
    items: VaultItem[]
}

export function ExportModal({ isOpen, onClose, items }: ExportModalProps) {
    const [format, setFormat] = useState<'csv' | 'json'>('csv')
    const [encrypt, setEncrypt] = useState(true)
    const [password, setPassword] = useState('')
    const [exporting, setExporting] = useState(false)
    const { toast } = useToast()

    if (!isOpen) return null

    const handleExport = async () => {
        if (items.length === 0) {
            toast({ type: 'error', message: 'No items to export' })
            return
        }

        if (format === 'json' && encrypt && !password) {
            toast({ type: 'error', message: 'Please enter an encryption password' })
            return
        }

        setExporting(true)

        try {
            let content: string
            let filename: string

            if (format === 'csv') {
                content = exportToCSV(items)
                filename = `passkeyper-export-${Date.now()}.csv`
            } else {
                // JSON export
                let encryptionKey: Uint8Array | undefined

                if (encrypt && password) {
                    // Derive key from password (simple for export, could be improved)
                    const encoder = new TextEncoder()
                    const passwordBytes = encoder.encode(password)
                    // Simple key derivation (should use proper KDF in production)
                    encryptionKey = new Uint8Array(32)
                    for (let i = 0; i < Math.min(passwordBytes.length, 32); i++) {
                        encryptionKey[i] = passwordBytes[i]
                    }
                }

                content = await exportToJSON(items, encryptionKey)
                filename = `passkeyper-export-${Date.now()}.json`
            }

            // Download file
            const blob = new Blob([content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            URL.revokeObjectURL(url)

            toast({
                type: 'success',
                message: `Exported ${items.length} items to ${filename}`
            })

            onClose()
        } catch (error: any) {
            toast({
                type: 'error',
                message: `Export failed: ${error.message}`
            })
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                {/* Header */}
                <div className="modal-header">
                    <h2>Export Passwords</h2>
                    <button onClick={onClose} className="modal-close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Format Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">
                            Export Format
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                    type="radio"
                                    name="format"
                                    value="csv"
                                    checked={format === 'csv'}
                                    onChange={(e) => setFormat('csv')}
                                    className="radio"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">CSV (Comma-Separated)</div>
                                    <div className="text-sm text-gray-400">
                                        Standard format, compatible with most password managers
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                    type="radio"
                                    name="format"
                                    value="json"
                                    checked={format === 'json'}
                                    onChange={(e) => setFormat('json')}
                                    className="radio"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">JSON (Encrypted)</div>
                                    <div className="text-sm text-gray-400">
                                        PassKeyPer native format with optional encryption
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Encryption Option (JSON only) */}
                    {format === 'json' && (
                        <div className="mb-6">
                            <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={encrypt}
                                    onChange={(e) => setEncrypt(e.target.checked)}
                                    className="checkbox"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {encrypt ? (
                                            <Lock className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Unlock className="w-4 h-4 text-yellow-400" />
                                        )}
                                        <span className="font-medium">Encrypt export file</span>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        {encrypt
                                            ? 'Recommended: Protects your data with AES-256-GCM'
                                            : 'Warning: Export will be unencrypted (plain text)'}
                                    </div>
                                </div>
                            </label>

                            {encrypt && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium mb-2">
                                        Encryption Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter a strong password"
                                        className="input w-full"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        You'll need this password to import the file later
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Warning */}
                    <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <div className="font-medium text-yellow-400 mb-1">
                                    Security Warning
                                </div>
                                <div className="text-gray-300">
                                    {format === 'csv' ? (
                                        <>CSV format stores passwords in <strong>plain text</strong>.
                                            Keep the file secure and delete it after importing elsewhere.</>
                                    ) : encrypt ? (
                                        <>Make sure to remember your encryption password.
                                            Without it, you won't be able to import the file.</>
                                    ) : (
                                        <>Unencrypted JSON export stores passwords in <strong>plain text</strong>.
                                            We recommend enabling encryption.</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item Count */}
                    <div className="mb-6 p-3 bg-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-400">
                            {items.length}
                        </div>
                        <div className="text-sm text-gray-400">
                            items will be exported
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={exporting || (format === 'json' && encrypt && !password)}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
                    </button>
                </div>
            </div>
        </div>
    )
}
