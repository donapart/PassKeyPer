import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export function TitleBar() {
    const handleMinimize = () => {
        window.electronAPI.minimizeWindow()
    }

    const handleMaximize = () => {
        window.electronAPI.maximizeWindow()
    }

    const handleClose = () => {
        window.electronAPI.quitApp()
    }

    return (
        <div className="titlebar h-8 bg-dark-950 border-b border-dark-800 flex items-center justify-between px-4">
            {/* App title */}
            <div className="text-xs font-medium text-dark-400">PassKeyPer</div>

            {/* Window controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleMinimize}
                    className="w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded transition-colors"
                >
                    <Minus className="w-4 h-4 text-dark-400" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="w-8 h-8 flex items-center justify-center hover:bg-dark-800 rounded transition-colors"
                >
                    <Square className="w-3 h-3 text-dark-400" />
                </button>
                <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center hover:bg-red-600 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-dark-400 hover:text-white" />
                </button>
            </div>
        </div>
    )
}
