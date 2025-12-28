/**
 * Vaults Routes
 * Vault management API
 */

import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// All routes require authentication
router.use(authenticate)

const createVaultSchema = z.object({
    name: z.string(),
    type: z.enum(['personal', 'work', 'shared']),
    encryptedKey: z.string(),
})

/**
 * GET /api/vaults
 * List user's vaults
 */
router.get('/', async (req, res) => {
    try {
        const vaults = await prisma.vault.findMany({
            where: { userId: req.userId! },
            include: {
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ vaults })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vaults' })
    }
})

/**
 * POST /api/vaults
 * Create new vault
 */
router.post('/', async (req, res) => {
    try {
        const data = createVaultSchema.parse(req.body)

        const vault = await prisma.vault.create({
            data: {
                userId: req.userId!,
                name: data.name,
                type: data.type,
                encryptedKey: data.encryptedKey,
            }
        })

        res.json({ vault })
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to create vault' })
    }
})

/**
 * GET /api/vaults/:id
 * Get vault details
 */
router.get('/:id', async (req, res) => {
    try {
        const vault = await prisma.vault.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId!
            },
            include: {
                items: {
                    select: {
                        id: true,
                        encryptedData: true,
                        version: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                }
            }
        })

        if (!vault) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        res.json({ vault })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vault' })
    }
})

/**
 * PUT /api/vaults/:id
 * Update vault
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, type } = req.body

        const vault = await prisma.vault.updateMany({
            where: {
                id: req.params.id,
                userId: req.userId!
            },
            data: {
                name,
                type,
                updatedAt: new Date()
            }
        })

        if (vault.count === 0) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update vault' })
    }
})

/**
 * DELETE /api/vaults/:id
 * Delete vault and all items
 */
router.delete('/:id', async (req, res) => {
    try {
        await prisma.vault.deleteMany({
            where: {
                id: req.params.id,
                userId: req.userId!
            }
        })

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vault' })
    }
})

export default router
