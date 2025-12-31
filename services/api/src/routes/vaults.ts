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
    teamId: z.string().optional(),
})

/**
 * GET /api/vaults
 * List user's vaults
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.userId!

        const vaults = await prisma.vault.findMany({
            where: {
                OR: [
                    { userId }, // Owned
                    { team: { members: { some: { userId } } } }, // Team vaults
                    { shares: { some: { userId } } } // Shared vaults
                ]
            },
            include: {
                _count: {
                    select: { items: true }
                },
                team: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ vaults })
    } catch (error) {
        console.error('Fetch vaults error:', error)
        res.status(500).json({ error: 'Failed to fetch vaults' })
    }
})

/**
 * POST /api/vaults
 * Create new vault
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.userId!
        const data = createVaultSchema.parse(req.body)

        // If teamId provided, verify membership
        if (data.teamId) {
            const membership = await prisma.teamMember.findFirst({
                where: { teamId: data.teamId, userId }
            })
            if (!membership) {
                return res.status(403).json({ error: 'Not a member of this team' })
            }
        }

        const vault = await prisma.vault.create({
            data: {
                userId,
                name: data.name,
                type: data.type,
                encryptedKey: data.encryptedKey,
                teamId: data.teamId,
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'VAULT_CREATED',
                resourceType: 'VAULT',
                resourceId: vault.id,
                details: JSON.stringify({ name: vault.name, type: vault.type, teamId: data.teamId })
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
        const userId = req.userId!
        const vault = await prisma.vault.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { userId },
                    { team: { members: { some: { userId } } } },
                    { shares: { some: { userId } } }
                ]
            },
            include: {
                items: {
                    where: { deletedAt: null },
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

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: req.userId!,
                action: 'VAULT_UPDATED',
                resourceType: 'VAULT',
                resourceId: req.params.id,
                details: JSON.stringify({ name, type })
            }
        })

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

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: req.userId!,
                action: 'VAULT_DELETED',
                resourceType: 'VAULT',
                resourceId: req.params.id
            }
        })

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vault' })
    }
})

export default router
