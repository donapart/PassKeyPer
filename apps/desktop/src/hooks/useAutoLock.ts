/**
 * Auto-lock hook
 * Automatically locks vault after inactivity
 */

import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/app-store'
import { toast } from '../components/Toast'

const DEFAULT_LOCK_MINUTES = 15
const STORAGE_KEY = 'autoLockMinutes'

export function useAutoLock() {
    const { isAuthenticated, isLocked, setIsLocked } = useAppStore()
    const timeoutRef = useRef<NodeJS.Timeout>()
    const lastActivityRef = useRef<number>(Date.now())

    useEffect(() => {
        if (!isAuthenticated || isLocked) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            return
        }

        const lockMinutes = parseInt(
            localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCK_MINUTES.toString()
        )
        const lockMs = lockMinutes * 60 * 1000

        const resetTimer = () => {
            lastActivityRef.current = Date.now()

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(async () => {
                // Lock the vault
                await window.electronAPI.lockVault()
                setIsLocked(true)
                toast.warning('Vault locked due to inactivity', 5000)
            }, lockMs)
        }

        // Activity listeners
        const activities = ['mousedown', 'keydown', 'scroll', 'touchstart']

        activities.forEach((activity) => {
            window.addEventListener(activity, resetTimer)
        })

        // Initial timer
        resetTimer()

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            activities.forEach((activity) => {
                window.removeEventListener(activity, resetTimer)
            })
        }
    }, [isAuthenticated, isLocked, setIsLocked])
}
