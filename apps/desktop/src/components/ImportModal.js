import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Import Modal Component
 * Allows importing passwords from various formats
 */
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { autoImport, detectImportFormat, validateImport, detectDuplicates, mergeItems } from '@passkeyper/io';
import { useToast } from '../hooks/useToast';
export function ImportModal({ isOpen, onClose, onImport, existingItems }) {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [mergeStrategy, setMergeStrategy] = useState('skip');
    const { toast } = useToast();
    if (!isOpen)
        return null;
    const handleFileSelect = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImportResult(null);
        }
    };
    const handleImport = async () => {
        if (!file) {
            toast({ type: 'error', message: 'Please select a file first' });
            return;
        }
        setImporting(true);
        try {
            // Read file
            const content = await file.text();
            // Auto-detect format and import
            const items = autoImport(content);
            // Validate items
            const { valid, invalid } = validateImport(items);
            // Detect duplicates
            const duplicates = detectDuplicates(valid, existingItems);
            setImportResult({ valid, invalid, duplicates });
            toast({
                type: 'success',
                message: `Found ${valid.length} items (${duplicates.length} duplicates)`
            });
        }
        catch (error) {
            toast({
                type: 'error',
                message: `Import failed: ${error.message}`
            });
        }
        finally {
            setImporting(false);
        }
    };
    const handleConfirmImport = () => {
        if (!importResult)
            return;
        // Apply merge strategy
        const itemsToImport = mergeItems(importResult.valid, existingItems, mergeStrategy);
        onImport(itemsToImport);
        toast({
            type: 'success',
            message: `Imported ${itemsToImport.length} items successfully`
        });
        onClose();
    };
    const formatName = file ? detectImportFormat(file.name) : null;
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", style: { maxWidth: '600px' }, children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Import Passwords" }), _jsx("button", { onClick: onClose, className: "modal-close", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Select File to Import" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "file", accept: ".csv,.json", onChange: handleFileSelect, className: "hidden", id: "import-file" }), _jsxs("label", { htmlFor: "import-file", className: "btn-secondary cursor-pointer flex items-center gap-2", children: [_jsx(Upload, { className: "w-4 h-4" }), "Choose File"] }), file && (_jsxs("span", { className: "text-sm text-gray-400", children: [file.name, formatName && formatName !== 'unknown' && (_jsxs("span", { className: "ml-2 text-blue-400", children: ["(", formatName, ")"] }))] }))] })] }), _jsxs("div", { className: "mb-6 p-4 bg-slate-800 rounded-lg", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Supported Formats:" }), _jsxs("ul", { className: "text-sm text-gray-400 space-y-1", children: [_jsx("li", { children: "\u2022 1Password (.csv)" }), _jsx("li", { children: "\u2022 Bitwarden (.json)" }), _jsx("li", { children: "\u2022 LastPass (.csv)" }), _jsx("li", { children: "\u2022 Chrome Passwords (.csv)" }), _jsx("li", { children: "\u2022 PassKeyPer (.csv, .json)" }), _jsx("li", { children: "\u2022 Auto-detection enabled \u2728" })] })] }), file && !importResult && (_jsx("button", { onClick: handleImport, disabled: importing, className: "btn-primary w-full", children: importing ? 'Analyzing...' : 'Analyze File' })), importResult && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "p-3 bg-green-900/20 border border-green-800 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-green-400", children: importResult.valid.length }), _jsx("div", { className: "text-xs text-gray-400", children: "Valid Items" })] }), _jsxs("div", { className: "p-3 bg-yellow-900/20 border border-yellow-800 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-400", children: importResult.duplicates.length }), _jsx("div", { className: "text-xs text-gray-400", children: "Duplicates" })] }), _jsxs("div", { className: "p-3 bg-red-900/20 border border-red-800 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-red-400", children: importResult.invalid.length }), _jsx("div", { className: "text-xs text-gray-400", children: "Invalid" })] })] }), importResult.duplicates.length > 0 && (_jsxs("div", { className: "p-4 bg-slate-800 rounded-lg", children: [_jsx("h3", { className: "text-sm font-medium mb-3", children: "How to handle duplicates?" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "merge-strategy", value: "skip", checked: mergeStrategy === 'skip', onChange: (e) => setMergeStrategy(e.target.value), className: "radio" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Skip duplicates" }), _jsx("div", { className: "text-xs text-gray-400", children: "Only import new items" })] })] }), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "merge-strategy", value: "replace", checked: mergeStrategy === 'replace', onChange: (e) => setMergeStrategy(e.target.value), className: "radio" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Replace existing" }), _jsx("div", { className: "text-xs text-gray-400", children: "Overwrite with imported data" })] })] }), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "merge-strategy", value: "keep-both", checked: mergeStrategy === 'keep-both', onChange: (e) => setMergeStrategy(e.target.value), className: "radio" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Keep both" }), _jsx("div", { className: "text-xs text-gray-400", children: "Save duplicates as \"name (imported)\"" })] })] })] })] })), _jsxs("button", { onClick: handleConfirmImport, className: "btn-primary w-full", children: ["Import ", importResult.valid.length, " Items"] })] }))] })] }) }));
}
//# sourceMappingURL=ImportModal.js.map