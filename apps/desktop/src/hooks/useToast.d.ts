export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}
export declare function useToast(): {
    toasts: Toast[];
    showToast: (message: string, type?: Toast["type"]) => string;
    success: (message: string) => string;
    error: (message: string) => string;
    info: (message: string) => string;
    warning: (message: string) => string;
    dismissToast: (id: string) => void;
};
export default useToast;
//# sourceMappingURL=useToast.d.ts.map