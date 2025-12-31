/**
 * Sharing Routes - Vault and item sharing functionality
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import crypto from 'crypto'

const router = express.Router()
const prisma = new PrismaClient()

// Apply auth middleware
router.use(authenticate)

/**
 * Invite user to vault
 * POST /api/sharing/invite
 */
router.post('/invite', async (req, res) => {
    try {
        const { vaultId, email, permission, encryptedVaultKey } = req.body
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

        // Check if user is inviting themselves
        const requester = await prisma.user.findUnique({ where: { id: userId } })
        if (requester?.email === email) {
            return res.status(400).json({ error: 'You cannot invite yourself' })
        }

        // Create sharing invite
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        const invite = await prisma.shareInvite.create({
            data: {
                vaultId,
                inviterId: userId,
                recipientEmail: email,
                permission: permission || 'read',
                encryptedVaultKey: encryptedVaultKey || '',
                token,
                expiresAt,
                status: 'pending'
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'SHARE_INVITE_CREATED',
                resourceType: 'VAULT',
                resourceId: vaultId,
                details: JSON.stringify({ recipientEmail: email, permission })
            }
        })

        res.json({ success: true, inviteId: invite.id, token })
    } catch (error: any) {
        console.error('Invite error:', error)
        res.status(500).json({ error: 'Failed to invite user' })
    }
})

/**
 * Accept sharing invite
 * POST /api/sharing/accept
 */
router.post('/accept', async (req, res) => {
    try {
        const { token } = req.body
        const userId = (req as any).userId
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) return res.status(404).json({ error: 'User not found' })

        const invite = await prisma.shareInvite.findFirst({
            where: {
                token,
                recipientEmail: user.email,
                status: 'pending'
            }
        })

        if (!invite) {
            return res.status(404).json({ error: 'Invite not found or already processed' })
        }

        if (invite.expiresAt < new Date()) {
            await prisma.shareInvite.update({
                where: { id: invite.id },
                data: { status: 'expired' }
            })
            return res.status(400).json({ error: 'Invite has expired' })
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the share
            const share = await tx.vaultShare.create({
                data: {
                    vaultId: invite.vaultId,
                    userId: user.id,
                    permission: invite.permission,
                    encryptedVaultKey: invite.encryptedVaultKey || ''
                }
            })

            // Update invite status
            await tx.shareInvite.update({
                where: { id: invite.id },
                data: { status: 'accepted' }
            })

            // Log action
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'SHARE_INVITE_ACCEPTED',
                    resourceType: 'VAULT',
                    resourceId: invite.vaultId,
                    details: JSON.stringify({ inviteId: invite.id })
                }
            })

            return share
        })

        res.json({ success: true, share: result })
    } catch (error: any) {
        console.error('Accept error:', error)
        res.status(500).json({ error: 'Failed to accept invite' })
    }
})

/**
 * List pending invites for current user
 * GET /api/sharing/invites/received
 */
router.get('/invites/received', async (req, res) => {
    try {
        const userId = (req as any).userId
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) return res.status(404).json({ error: 'User not found' })

        const invites = await prisma.shareInvite.findMany({
            where: {
                recipientEmail: user.email,
                status: 'pending',
                expiresAt: { gt: new Date() }
            },
            include: {
                inviter: {
                    select: { email: true }
                },
                vault: {
                    select: { name: true }
                }
            }
        })

        res.json({ invites })
    } catch (error: any) {
        console.error('List received invites error:', error)
        res.status(500).json({ error: 'Failed to list invites' })
    }
})

/**
 * List sent invites by current user
 * GET /api/sharing/invites/sent
 */
router.get('/invites/sent', async (req, res) => {
    try {
        const userId = (req as any).userId

        const invites = await prisma.shareInvite.findMany({
            where: {
                inviterId: userId
            },
            include: {
                vault: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({ invites })
    } catch (error: any) {
        console.error('List sent invites error:', error)
        res.status(500).json({ error: 'Failed to list invites' })
    }
})

/**
 * List shared vaults (vaults shared with me)
 * GET /api/sharing/shared-with-me
 */
router.get('/shared-with-me', async (req, res) => {
    try {
        const userId = (req as any).userId

        const shares = await prisma.vaultShare.findMany({
            where: {
                userId
            },
            include: {
                vault: {
                    include: {
                        user: {
                            select: { email: true }
                        }
                    }
                }
            }
        })

        res.json({ shares })
    } catch (error: any) {
        console.error('List shared vaults error:', error)
        res.status(500).json({ error: 'Failed to list shared vaults' })
    }
})

/**
 * Revoke access
 * DELETE /api/sharing/shares/:id
 */
router.delete('/shares/:id', async (req, res) => {
    try {
        const { id } = req.params
        const userId = (req as any).userId

        // User can revoke if they are the owner of the vault OR the recipient (leaving)
        const share = await prisma.vaultShare.findUnique({
            where: { id },
            include: { vault: true }
        })

        if (!share) {
            return res.status(404).json({ error: 'Sharing not found' })
        }

        if (share.vault.userId !== userId && share.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        await prisma.vaultShare.delete({
            where: { id }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'SHARE_REVOKED',
                resourceType: 'VAULT',
                resourceId: share.vaultId,
                details: JSON.stringify({ revokedUserId: share.userId })
            }
        })

        res.json({ success: true, message: 'Access revoked successfully' })
    } catch (error: any) {
        console.error('Revoke error:', error)
        res.status(500).json({ error: 'Failed to revoke access' })
    }
})

export default router
