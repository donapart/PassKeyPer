import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';
export const useToastStore = create((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        // Auto-remove after duration
        const duration = toast.duration ?? 3000;
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, duration);
    },
    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md", children: toasts.map((toast) => (_jsx(Toast, { ...toast, onClose: () => removeToast(toast.id) }, toast.id))) }));
}
function Toast({ type, message, onClose }) {
    const icons = {
        success: _jsx(CheckCircle, { className: "w-5 h-5" }),
        error: _jsx(AlertCircle, { className: "w-5 h-5" }),
        info: _jsx(Info, { className: "w-5 h-5" }),
        warning: _jsx(AlertTriangle, { className: "w-5 h-5" }),
    };
    const colors = {
        success: 'bg-green-500/10 border-green-500/50 text-green-400',
        error: 'bg-red-500/10 border-red-500/50 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    };
    return (_jsxs("div", { className: `flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md animate-slideUp ${colors[type]}`, children: [icons[type], _jsx("p", { className: "flex-1 text-sm font-medium", children: message }), _jsx("button", { onClick: onClose, className: "hover:bg-white/10 rounded p-1 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }));
}
// Helper functions for easy toast creation
export const toast = {
    success: (message, duration) => useToastStore.getState().addToast({ type: 'success', message, duration }),
    error: (message, duration) => useToastStore.getState().addToast({ type: 'error', message, duration }),
    info: (message, duration) => useToastStore.getState().addToast({ type: 'info', message, duration }),
    warning: (message, duration) => useToastStore.getState().addToast({ type: 'warning', message, duration }),
};
//# sourceMappingURL=Toast.js.map