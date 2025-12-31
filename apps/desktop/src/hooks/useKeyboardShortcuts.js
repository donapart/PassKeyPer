/**
 * Keyboard shortcuts hook
 * Global keyboard shortcuts for the app
 */
import { useEffect } from 'react';
export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
                if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.handler();
                    break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
}
// Predefined shortcuts
export const shortcuts = {
    SEARCH: { key: 'f', ctrl: true, description: 'Focus search' },
    NEW_ITEM: { key: 'n', ctrl: true, description: 'Create new item' },
    LOCK: { key: 'l', ctrl: true, description: 'Lock vault' },
    SETTINGS: { key: ',', ctrl: true, description: 'Open settings' },
    CLOSE_MODAL: { key: 'Escape', description: 'Close modal/dialog' },
    REFRESH: { key: 'r', ctrl: true, description: 'Refresh vault' },
};
//# sourceMappingURL=useKeyboardShortcuts.js.map