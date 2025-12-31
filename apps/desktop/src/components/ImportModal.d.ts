/**
 * Import Modal Component
 * Allows importing passwords from various formats
 */
import type { VaultItem } from '@passkeyper/core';
interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: VaultItem[]) => void;
    existingItems: VaultItem[];
}
export declare function ImportModal({ isOpen, onClose, onImport, existingItems }: ImportModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ImportModal.d.ts.map