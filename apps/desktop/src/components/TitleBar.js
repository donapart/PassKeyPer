import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Minus, Square, X } from 'lucide-react';
export function TitleBar() {
    const handleMinimize = () => {
        window.electronAPI.minimizeWindow();
    };
    const handleMaximize = () => {
        window.electronAPI.maximizeWindow();
    };
    const handleClose = () => {
        window.electronAPI.quitApp();
    };
    return (_jsxs("div", { className: "titlebar h-8 bg-dark-950 border-b border-dark-800 flex items-center justify-between px-4", children: [_jsx("div", { className: "text-xs font-medium text-dark-400", children: "PassKeyPer" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: handleMinimize, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded transition-colors", children: _jsx(Minus, { className: "w-4 h-4 text-dark-400" }) }), _jsx("button", { onClick: handleMaximize, className: "w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded transition-colors", children: _jsx(Square, { className: "w-3 h-3 text-dark-400" }) }), _jsx("button", { onClick: handleClose, className: "w-8 h-8 flex items-center justify-center hover:bg-red-600 rounded transition-colors", children: _jsx(X, { className: "w-4 h-4 text-dark-400 hover:text-white" }) })] })] }));
}
//# sourceMappingURL=TitleBar.js.map