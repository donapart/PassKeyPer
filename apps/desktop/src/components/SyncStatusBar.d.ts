/**
 * SyncStatusBar - Shows cloud sync status
 */
export interface SyncStatusBarProps {
    sync: () => Promise<void>;
    isConnected: boolean;
    isSyncing: boolean;
    lastSync: Date | null;
    errors: any[];
    itemsUpdated: number;
    itemsConflicted: number;
}
export declare function SyncStatusBar({ sync, isConnected, isSyncing, lastSync, errors, itemsUpdated, itemsConflicted }: SyncStatusBarProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=SyncStatusBar.d.ts.map