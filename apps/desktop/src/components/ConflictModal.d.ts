/**
 * ConflictModal - Resolve sync conflicts
 */
interface ConflictData {
    id: string;
    itemId: string;
    name: string;
    localVersion: {
        version: number;
        updatedAt: Date;
        data: any;
    };
    serverVersion: {
        version: number;
        updatedAt: Date;
        data: any;
    };
}
interface ConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    conflicts: ConflictData[];
    onResolve: (itemId: string, resolution: 'local' | 'server' | 'merge') => void;
}
export declare function ConflictModal({ isOpen, onClose, conflicts, onResolve }: ConflictModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ConflictModal.d.ts.map