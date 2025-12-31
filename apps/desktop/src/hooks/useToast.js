import { useState, useCallback } from 'react';
export function useToast() {
    const [toasts, setToasts] = useState([]);
    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast = { id, message, type };
        setToasts(prev => [...prev, toast]);
        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
        return id;
    }, []);
    const success = useCallback((message) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message) => showToast(message, 'error'), [showToast]);
    const info = useCallback((message) => showToast(message, 'info'), [showToast]);
    const warning = useCallback((message) => showToast(message, 'warning'), [showToast]);
    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);
    return {
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        dismissToast
    };
}
export default useToast;
//# sourceMappingURL=useToast.js.map