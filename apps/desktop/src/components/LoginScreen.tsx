import React, { useState } from 'react'
import pkpLogo from '../assets/pkp_logo.png'
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAppStore } from '../store/app-store'

export function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isSignup, setIsSignup] = useState(false)

    const { setUser, setIsLocked } = useAppStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (isSignup) {
                // Create account
                const result = await window.electronAPI.createAccount(email, password)
                if (result.success) {
                    setUser({ email, salt: result.salt })
                    setIsLocked(false)
                    // Save salt to localStorage for next login
                    localStorage.setItem('user_email', email)
                    localStorage.setItem('user_salt', result.salt)
                } else {
                    setError(result.error || 'Failed to create account')
                }
            } else {
                // Login
                const salt = localStorage.getItem('user_salt')
                if (!salt) {
                    setError('Account not found. Please create an account first.')
                    setIsLoading(false)
                    return
                }

                const result = await window.electronAPI.login(email, password, salt)
                if (result.success) {
                    setUser({ email, salt })
                    setIsLocked(false)
                } else {
                    setError('Invalid password')
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="mb-6">
                        <img
                            src={pkpLogo}
                            alt="PassKeyPer"
                            className="w-24 h-24 rounded-2xl mx-auto shadow-2xl shadow-primary-500/20"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">PassKeyPer</h1>
                    <p className="text-dark-400">
                        {isSignup ? 'Create your secure vault' : 'Welcome back'}
                    </p>
                </div>

                {/* Login/Signup Form */}
                <div className="card animate-slideUp">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-11 w-full"
                                    placeholder="your@email.com"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Master Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Master Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-11 pr-11 w-full"
                                    placeholder="Enter your master password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {isSignup && (
                                <p className="mt-2 text-xs text-dark-400">
                                    Choose a strong master password. You won't be able to recover it if you forget!
                                </p>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            {isLoading ? 'Please wait...' : isSignup ? 'Create Account' : 'Unlock Vault'}
                        </button>

                        {/* Toggle signup/login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup)
                                    setError('')
                                }}
                                className="text-sm text-primary-400 hover:text-primary-300"
                            >
                                {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security notice */}
                <div className="mt-6 text-center text-xs text-dark-500">
                    <p>🔒 Zero-knowledge encryption · Your data, your keys</p>
                </div>
            </div>
        </div>
    )
}
