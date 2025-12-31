/**
 * Keyboard shortcuts hook
 * Global keyboard shortcuts for the app
 */
export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    handler: () => void;
    description: string;
}
export declare function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void;
export declare const shortcuts: {
    SEARCH: {
        key: string;
        ctrl: boolean;
        description: string;
    };
    NEW_ITEM: {
        key: string;
        ctrl: boolean;
        description: string;
    };
    LOCK: {
        key: string;
        ctrl: boolean;
        description: string;
    };
    SETTINGS: {
        key: string;
        ctrl: boolean;
        description: string;
    };
    CLOSE_MODAL: {
        key: string;
        description: string;
    };
    REFRESH: {
        key: string;
        ctrl: boolean;
        description: string;
    };
};
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map