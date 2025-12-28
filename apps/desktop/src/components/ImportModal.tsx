/**
 * Import Modal Component
 * Allows importing passwords from various formats
 */

import React, { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import {
    autoImport,
    detectImportFormat,
    validateImport,
    detectDuplicates,
    mergeItems,
    type MergeStrategy
} from '@passkeyper/io'
import type { VaultItem } from '@passkeyper/core'
import { useToast } from '../hooks/useToast'

interface ImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (items: VaultItem[]) => void
    existingItems: VaultItem[]
}

export function ImportModal({ isOpen, onClose, onImport, existingItems }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{
        valid: VaultItem[]
        invalid: any[]
        duplicates: VaultItem[]
    } | null>(null)
    const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('skip')
    const { toast } = useToast()

    if (!isOpen) return null

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setImportResult(null)
        }
    }

    const handleImport = async () => {
        if (!file) {
            toast({ type: 'error', message: 'Please select a file first' })
            return
        }

        setImporting(true)

        try {
            // Read file
            const content = await file.text()

            // Auto-detect format and import
            const items = autoImport(content)

            // Validate items
            const { valid, invalid } = validateImport(items)

            // Detect duplicates
            const duplicates = detectDuplicates(valid, existingItems)

            setImportResult({ valid, invalid, duplicates })

            toast({
                type: 'success',
                message: `Found ${valid.length} items (${duplicates.length} duplicates)`
            })
        } catch (error: any) {
            toast({
                type: 'error',
                message: `Import failed: ${error.message}`
            })
        } finally {
            setImporting(false)
        }
    }

    const handleConfirmImport = () => {
        if (!importResult) return

        // Apply merge strategy
        const itemsToImport = mergeItems(
            importResult.valid,
            existingItems,
            mergeStrategy
        )

        onImport(itemsToImport)
        toast({
            type: 'success',
            message: `Imported ${itemsToImport.length} items successfully`
        })
        onClose()
    }

    const formatName = file ? detectImportFormat(file.name) : null

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                {/* Header */}
                <div className="modal-header">
                    <h2>Import Passwords</h2>
                    <button onClick={onClose} className="modal-close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* File Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Select File to Import
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".csv,.json"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="import-file"
                            />
                            <label
                                htmlFor="import-file"
                                className="btn-secondary cursor-pointer flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Choose File
                            </label>
                            {file && (
                                <span className="text-sm text-gray-400">
                                    {file.name}
                                    {formatName && formatName !== 'unknown' && (
                                        <span className="ml-2 text-blue-400">
                                            ({formatName})
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Supported Formats */}
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Supported Formats:</h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• 1Password (.csv)</li>
                            <li>• Bitwarden (.json)</li>
                            <li>• LastPass (.csv)</li>
                            <li>• Chrome Passwords (.csv)</li>
                            <li>• PassKeyPer (.csv, .json)</li>
                            <li>• Auto-detection enabled ✨</li>
                        </ul>
                    </div>

                    {/* Import Button */}
                    {file && !importResult && (
                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="btn-primary w-full"
                        >
                            {importing ? 'Analyzing...' : 'Analyze File'}
                        </button>
                    )}

                    {/* Import Results */}
                    {importResult && (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-green-900/20 border border-green-800 rounded">
                                    <div className="text-2xl font-bold text-green-400">
                                        {importResult.valid.length}
                                    </div>
                                    <div className="text-xs text-gray-400">Valid Items</div>
                                </div>
                                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {importResult.duplicates.length}
                                    </div>
                                    <div className="text-xs text-gray-400">Duplicates</div>
                                </div>
                                <div className="p-3 bg-red-900/20 border border-red-800 rounded">
                                    <div className="text-2xl font-bold text-red-400">
                                        {importResult.invalid.length}
                                    </div>
                                    <div className="text-xs text-gray-400">Invalid</div>
                                </div>
                            </div>

                            {/* Duplicate Handling */}
                            {importResult.duplicates.length > 0 && (
                                <div className="p-4 bg-slate-800 rounded-lg">
                                    <h3 className="text-sm font-medium mb-3">
                                        How to handle duplicates?
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="merge-strategy"
                                                value="skip"
                                                checked={mergeStrategy === 'skip'}
                                                onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                                                className="radio"
                                            />
                                            <div>
                                                <div className="text-sm font-medium">Skip duplicates</div>
                                                <div className="text-xs text-gray-400">
                                                    Only import new items
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="merge-strategy"
                                                value="replace"
                                                checked={mergeStrategy === 'replace'}
                                                onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                                                className="radio"
                                            />
                                            <div>
                                                <div className="text-sm font-medium">Replace existing</div>
                                                <div className="text-xs text-gray-400">
                                                    Overwrite with imported data
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="merge-strategy"
                                                value="keep-both"
                                                checked={mergeStrategy === 'keep-both'}
                                                onChange={(e) => setMergeStrategy(e.target.value as MergeStrategy)}
                                                className="radio"
                                            />
                                            <div>
                                                <div className="text-sm font-medium">Keep both</div>
                                                <div className="text-xs text-gray-400">
                                                    Save duplicates as "name (imported)"
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirmImport}
                                className="btn-primary w-full"
                            >
                                Import {importResult.valid.length} Items
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
