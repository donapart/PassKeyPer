/**
 * Sharing Routes - Vault and item sharing functionality
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateJWT } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Apply auth middleware
router.use(authenticateJWT)

/**
 * Invite user to vault
 * POST /api/sharing/invite
 */
router.post('/invite', async (req, res) => {
    try {
        const { vaultId, email, permission } = req.body
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

        // Find invited user
        const invitedUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!invitedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check if already shared
        const existing = await prisma.sharedVault.findFirst({
            where: {
                vaultId,
                userId: invitedUser.id
            }
        })

        if (existing) {
            return res.status(400).json({ error: 'Already shared with this user' })
        }

        // Create sharing invite
        const shared = await prisma.sharedVault.create({
            data: {
                vaultId,
                userId: invitedUser.id,
                permission: permission || 'read',
                sharedBy: userId
            }
        })

        res.json(shared)
    } catch (error: any) {
        console.error('Invite error:', error)
        res.status(500).json({ error: 'Failed to invite user' })
    }
})

/**
 * Accept sharing invite
 * PUT /api/sharing/accept/:id
 */
router.put('/accept/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        const shared = await prisma.sharedVault.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!shared) {
            return res.status(404).json({ error: 'Invite not found' })
        }

        // Mark as accepted (you might add an 'accepted' field to schema)
        // For now, just return the sharing
        res.json(shared)
    } catch (error: any) {
        console.error('Accept error:', error)
        res.status(500).json({ error: 'Failed to accept invite' })
    }
})

/**
 * Revoke access
 * DELETE /api/sharing/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        const shared = await prisma.sharedVault.findFirst({
            where: {
                id,
                vault: {
                    userId
                }
            }
        })

        if (!shared) {
            return res.status(404).json({ error: 'Sharing not found' })
        }

        await prisma.sharedVault.delete({
            where: { id }
        })

        res.json({ message: 'Access revoked successfully' })
    } catch (error: any) {
        console.error('Revoke error:', error)
        res.status(500).json({ error: 'Failed to revoke access' })
    }
})

/**
 * List pending invites
 * GET /api/sharing/pending
 */
router.get('/pending', async (req, res) => {
    try {
        const userId = (req as any).userId

        const pending = await prisma.sharedVault.findMany({
            where: {
                userId
            },
            include: {
                vault: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        })

        res.json({ pending })
    } catch (error: any) {
        console.error('List pending error:', error)
        res.status(500).json({ error: 'Failed to list pending invites' })
    }
})

/**
 * List shared vaults (vaults shared with me)
 * GET /api/sharing/shared-with-me
 */
router.get('/shared-with-me', async (req, res) => {
    try {
        const userId = (req as any).userId

        const sharedVaults = await prisma.sharedVault.findMany({
            where: {
                userId
            },
            include: {
                vault: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        })

        res.json({ vaults: sharedVaults })
    } catch (error: any) {
        console.error('List shared vaults error:', error)
        res.status(500).json({ error: 'Failed to list shared vaults' })
    }
})

export default router
