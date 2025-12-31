/**
 * Authentication Routes
 * Registration, Login, Session Management
 */

import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    authSalt: z.string(),
    authHash: z.string(),
    publicKey: z.string(),
    encryptedPrivateKey: z.string(),
})

const loginSchema = z.object({
    email: z.string().email(),
    authHash: z.string(),
})

const verify2faSchema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(12),
})

function generateRecoveryCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () =>
        crypto.randomBytes(5).toString('hex').toUpperCase()
    )
}

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body)

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existing) {
            return res.status(400).json({ error: 'Email already registered' })
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                authSalt: data.authSalt,
                authHash: data.authHash,
                publicKey: data.publicKey,
                encryptedPrivateKey: data.encryptedPrivateKey,
            }
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, jti: crypto.randomUUID() },
            JWT_SECRET,
            { expiresIn: '30d' }
        )

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        })

        res.json({
            user: {
                id: user.id,
                email: user.email,
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey,
            },
            token,
        })
    } catch (error: any) {
        console.error('Registration error:', error)
        res.status(400).json({ error: error.message || 'Registration failed' })
    }
})

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res) => {
    try {
        const data = loginSchema.parse(req.body)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Verify auth hash
        if (user.authHash !== data.authHash) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            return res.json({
                twoFactorRequired: true,
                email: user.email
            })
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        )

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        })

        res.json({
            user: {
                id: user.id,
                email: user.email,
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey,
                twoFactorEnabled: user.twoFactorEnabled
            },
            token,
        })
    } catch (error: any) {
        console.error('Login error:', error)
        res.status(400).json({ error: error.message || 'Login failed' })
    }
})

/**
 * POST /api/auth/login/verify-2fa
 * Verify 2FA code during login
 */
router.post('/login/verify-2fa', async (req, res) => {
    try {
        const { email, code } = verify2faSchema.parse(req.body)

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.twoFactorSecret) {
            return res.status(401).json({ error: '2FA not enabled for this user' })
        }

        // Verify code (TOTP)
        let isValid = false
        if (code.length === 6) {
            isValid = authenticator.verify({
                token: code,
                secret: user.twoFactorSecret
            })
        }

        // Check recovery codes if TOTP failed or skip if it's longer
        if (!isValid && user.twoFactorRecoveryCodes) {
            const recoveryCodes: string[] = JSON.parse(user.twoFactorRecoveryCodes)
            for (let i = 0; i < recoveryCodes.length; i++) {
                const match = await bcrypt.compare(code.trim().toUpperCase(), recoveryCodes[i])
                if (match) {
                    isValid = true;
                    // Remove used recovery code
                    recoveryCodes.splice(i, 1)
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { twoFactorRecoveryCodes: JSON.stringify(recoveryCodes) }
                    })
                    break
                }
            }
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid 2FA code or recovery code' })
        }

        // Success - Log in
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        )

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        })

        res.json({
            user: {
                id: user.id,
                email: user.email,
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey,
                twoFactorEnabled: true
            },
            token,
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Verification failed' })
    }
})

/**
 * TOTP Management Routes (Protected)
 */

router.get('/2fa/setup', authenticate, async (req, res) => {
    try {
        const userId = req.userId!
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) return res.status(404).json({ error: 'User not found' })

        // Generate secret if not already present or if regenerating
        const secret = authenticator.generateSecret()
        const otpauth = authenticator.keyuri(user.email, 'PassKeyPer', secret)
        const qrCodeUrl = await QRCode.toDataURL(otpauth)

        // We don't save it yet! User must verify first.
        // We'll return the secret for the next step (enable).
        res.json({ secret, qrCodeUrl })
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate 2FA setup' })
    }
})

router.post('/2fa/enable', authenticate, async (req, res) => {
    try {
        const userId = req.userId!
        const { secret, code } = z.object({
            secret: z.string(),
            code: z.string().length(6)
        }).parse(req.body)

        const isValid = authenticator.verify({
            token: code,
            secret
        })

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid code' })
        }

        const recoveryCodes = generateRecoveryCodes(10)
        const hashedRecoveryCodes = await Promise.all(
            recoveryCodes.map(code => bcrypt.hash(code, 10))
        )

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret,
                twoFactorRecoveryCodes: JSON.stringify(hashedRecoveryCodes)
            }
        })

        res.json({
            success: true,
            recoveryCodes
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to enable 2FA' })
    }
})

router.post('/2fa/disable', authenticate, async (req, res) => {
    try {
        const userId = req.userId!
        const { code } = z.object({ code: z.string() }).parse(req.body)

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ error: '2FA not enabled' })
        }

        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret
        })

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid code' })
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorRecoveryCodes: null
            }
        })

        res.json({ success: true })
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to disable 2FA' })
    }
})

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (token) {
            await prisma.session.deleteMany({
                where: { token }
            })
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' })
    }
})

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                publicKey: true,
                encryptedPrivateKey: true,
                createdAt: true,
                lastLoginAt: true,
                twoFactorEnabled: true,
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user })
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
})

export default router
