/**
 * Export Modal Component
 * Allows exporting passwords to CSV or JSON
 */
import type { VaultItem } from '@passkeyper/core';
interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: VaultItem[];
}
export declare function ExportModal({ isOpen, onClose, items }: ExportModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ExportModal.d.ts.map