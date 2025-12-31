interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}
interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}
export declare const useToastStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ToastStore>>;
export declare function ToastContainer(): import("react/jsx-runtime").JSX.Element;
declare function Toast({ type, message, onClose }: Toast & {
    onClose: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare const toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
};
export {};
//# sourceMappingURL=Toast.d.ts.map