/**
 * Item Routes - CRUD operations for vault items
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Apply auth middleware to all routes
router.use(authenticateJWT)

/**
 * Create new item
 * POST /api/items
 */
router.post('/', async (req, res) => {
    try {
        const { vaultId, type, encryptedData, metadata } = req.body
        const userId = (req as any).userId
        const deviceId = (req as any).deviceId

        // Verify vault belongs to user
        const vault = await prisma.vault.findFirst({
            where: {
                id: vaultId,
                userId
            }
        })

        if (!vault) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        // Create item
        const item = await prisma.item.create({
            data: {
                vaultId,
                type,
                encryptedData,
                metadata: metadata || {},
                version: 1,
                lastModifiedBy: deviceId || 'unknown'
            }
        })

        res.json(item)
    } catch (error: any) {
        console.error('Create item error:', error)
        res.status(500).json({ error: 'Failed to create item' })
    }
})

/**
 * Get item by ID
 * GET /api/items/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        const item = await prisma.item.findFirst({
            where: {
                id,
                vault: {
                    userId
                }
            },
            include: {
                vault: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        if (!item) {
            return res.status(404).json({ error: 'Item not found' })
        }

        res.json(item)
    } catch (error: any) {
        console.error('Get item error:', error)
        res.status(500).json({ error: 'Failed to get item' })
    }
})

/**
 * Update item
 * PUT /api/items/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { encryptedData, metadata, version } = req.body
        const userId = (req as any).userId
        const deviceId = (req as any).deviceId

        // Check if item exists and belongs to user
        const existingItem = await prisma.item.findFirst({
            where: {
                id,
                vault: {
                    userId
                }
            }
        })

        if (!existingItem) {
            return res.status(404).json({ error: 'Item not found' })
        }

        // Version check for conflict detection
        if (version && existingItem.version !== version) {
            return res.status(409).json({
                error: 'Conflict detected',
                currentVersion: existingItem.version,
                providedVersion: version
            })
        }

        // Update item
        const item = await prisma.item.update({
            where: { id },
            data: {
                encryptedData: encryptedData || existingItem.encryptedData,
                metadata: metadata || existingItem.metadata,
                version: existingItem.version + 1,
                lastModifiedBy: deviceId || 'unknown',
                updatedAt: new Date()
            }
        })

        res.json(item)
    } catch (error: any) {
        console.error('Update item error:', error)
        res.status(500).json({ error: 'Failed to update item' })
    }
})

/**
 * Delete item
 * DELETE /api/items/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        // Check if item exists and belongs to user
        const item = await prisma.item.findFirst({
            where: {
                id,
                vault: {
                    userId
                }
            }
        })

        if (!item) {
            return res.status(404).json({ error: 'Item not found' })
        }

        // Soft delete
        await prisma.item.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        res.json({ message: 'Item deleted successfully' })
    } catch (error: any) {
        console.error('Delete item error:', error)
        res.status(500).json({ error: 'Failed to delete item' })
    }
})

/**
 * List items in vault
 * GET /api/vaults/:vaultId/items
 */
router.get('/vault/:vaultId', async (req, res) => {
    try {
        const { vaultId } = req.params
        const userId = (req as any).userId

        // Verify vault belongs to user
        const vault = await prisma.vault.findFirst({
            where: {
                id: vaultId,
                userId
            }
        })

        if (!vault) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        // Get all non-deleted items
        const items = await prisma.item.findMany({
            where: {
                vaultId,
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        res.json({ items })
    } catch (error: any) {
        console.error('List items error:', error)
        res.status(500).json({ error: 'Failed to list items' })
    }
})

/**
 * Search items
 * GET /api/items/search?q=query&vaultId=xxx
 */
router.get('/search', async (req, res) => {
    try {
        const { q, vaultId } = req.query
        const userId = (req as any).userId

        if (!q) {
            return res.status(400).json({ error: 'Query parameter required' })
        }

        // Build search query
        const where: any = {
            vault: {
                userId
            },
            deletedAt: null
        }

        if (vaultId) {
            where.vaultId = vaultId
        }

        // Note: This searches metadata, not encrypted data
        // Client-side filtering needed for encrypted content
        const items = await prisma.item.findMany({
            where,
            orderBy: {
                updatedAt: 'desc'
            }
        })

        res.json({ items })
    } catch (error: any) {
        console.error('Search items error:', error)
        res.status(500).json({ error: 'Failed to search items' })
    }
})

export default router
