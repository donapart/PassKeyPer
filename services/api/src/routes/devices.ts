/**
 * Devices Routes - Device registration and management
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateJWT } from '../middleware/auth'
import crypto from 'crypto'

const router = express.Router()
const prisma = new PrismaClient()

// Apply auth middleware
router.use(authenticateJWT)

/**
 * Register new device
 * POST /api/devices/register
 */
router.post('/register', async (req, res) => {
    try {
        const { name, type, fingerprint } = req.body
        const userId = (req as any).userId

        // Generate device ID if not provided
        const deviceId = fingerprint || crypto.randomBytes(16).toString('hex')

        // Check if device already registered
        const existing = await prisma.device.findFirst({
            where: {
                userId,
                fingerprint: deviceId
            }
        })

        if (existing) {
            return res.json(existing)
        }

        // Register device
        const device = await prisma.device.create({
            data: {
                userId,
                name: name || 'Unknown Device',
                type: type || 'desktop',
                fingerprint: deviceId,
                lastSeenAt: new Date()
            }
        })

        res.json(device)
    } catch (error: any) {
        console.error('Register device error:', error)
        res.status(500).json({ error: 'Failed to register device' })
    }
})

/**
 Get all devices
 * GET /api/devices
 */
router.get('/', async (req, res) => {
    try {
        const userId = (req as any).userId

        const devices = await prisma.device.findMany({
            where: {
                userId
            },
            orderBy: {
                lastSeenAt: 'desc'
            }
        })

        res.json({ devices })
    } catch (error: any) {
        console.error('List devices error:', error)
        res.status(500).json({ error: 'Failed to list devices' })
    }
})

/**
 * Update device (mainly lastSeen)
 * PUT /api/devices/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        const userId = (req as any).userId

        const device = await prisma.device.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!device) {
            return res.status(404).json({ error: 'Device not found' })
        }

        const updated = await prisma.device.update({
            where: { id },
            data: {
                name: name || device.name,
                lastSeenAt: new Date()
            }
        })

        res.json(updated)
    } catch (error: any) {
        console.error('Update device error:', error)
        res.status(500).json({ error: 'Failed to update device' })
    }
})

/**
 * Remove device
 * DELETE /api/devices/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        const device = await prisma.device.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!device) {
            return res.status(404).json({ error: 'Device not found' })
        }

        await prisma.device.delete({
            where: { id }
        })

        res.json({ message: 'Device removed successfully' })
    } catch (error: any) {
        console.error('Remove device error:', error)
        res.status(500).json({ error: 'Failed to remove device' })
    }
})

/**
 * Update last seen timestamp
 * POST /api/devices/:id/ping
 */
router.post('/:id/ping', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        const device = await prisma.device.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!device) {
            return res.status(404).json({ error: 'Device not found' })
        }

        await prisma.device.update({
            where: { id },
            data: {
                lastSeenAt: new Date()
            }
        })

        res.json({ message: 'Ping received' })
    } catch (error: any) {
        console.error('Ping error:', error)
        res.status(500).json({ error: 'Failed to ping device' })
    }
})

export default router
