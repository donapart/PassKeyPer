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
            },
            token,
        })
    } catch (error: any) {
        console.error('Login error:', error)
        res.status(400).json({ error: error.message || 'Login failed' })
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
