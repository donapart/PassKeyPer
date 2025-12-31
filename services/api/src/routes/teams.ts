/**
 * Teams Routes - Multi-user collaboration management
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { z } from 'zod'

const router = express.Router()
const prisma = new PrismaClient()

// Apply auth middleware
router.use(authenticate)

const createTeamSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
})

/**
 * List user's teams
 * GET /api/teams
 */
router.get('/', async (req, res) => {
    try {
        const userId = (req as any).userId

        const teams = await prisma.team.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: {
                _count: {
                    select: { members: true, vaults: true }
                }
            }
        })

        res.json({ teams })
    } catch (error: any) {
        console.error('List teams error:', error)
        res.status(500).json({ error: 'Failed to list teams' })
    }
})

/**
 * Create new team
 * POST /api/teams
 */
router.post('/', async (req, res) => {
    try {
        const userId = (req as any).userId
        const { name, description } = createTeamSchema.parse(req.body)

        const team = await prisma.team.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId,
                        role: 'OWNER'
                    }
                },
                policy: {
                    create: {} // Use defaults
                }
            },
            include: {
                members: true,
                policy: true
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'TEAM_CREATED',
                resourceType: 'TEAM',
                resourceId: team.id,
                details: JSON.stringify({ name })
            }
        })

        res.json({ team })
    } catch (error: any) {
        console.error('Create team error:', error)
        res.status(400).json({ error: error.message || 'Failed to create team' })
    }
})

/**
 * Get team details
 * GET /api/teams/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = (req as any).userId
        const { id } = req.params

        const team = await prisma.team.findFirst({
            where: {
                id,
                members: { some: { userId } }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true }
                        }
                    }
                },
                vaults: {
                    select: { id: true, name: true, type: true }
                },
                policy: true
            }
        })

        if (!team) {
            return res.status(404).json({ error: 'Team not found' })
        }

        res.json({ team })
    } catch (error: any) {
        console.error('Get team error:', error)
        res.status(500).json({ error: 'Failed to get team' })
    }
})

/**
 * Add member to team
 * POST /api/teams/:id/members
 */
router.post('/:id/members', async (req, res) => {
    try {
        const requesterId = (req as any).userId
        const { id } = req.params
        const { email, role } = req.body

        // Verify requester is OWNER or ADMIN
        const member = await prisma.teamMember.findFirst({
            where: {
                teamId: id,
                userId: requesterId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Unauthorized to add members' })
        }

        // Find user by email
        const userToAdd = await prisma.user.findUnique({ where: { email } })
        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Add to team
        const newMember = await prisma.teamMember.create({
            data: {
                teamId: id,
                userId: userToAdd.id,
                role: role || 'MEMBER'
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'TEAM_MEMBER_ADDED',
                resourceType: 'TEAM',
                resourceId: id,
                details: JSON.stringify({ addedUserId: userToAdd.id, role })
            }
        })

        res.json({ success: true, member: newMember })
    } catch (error: any) {
        console.error('Add team member error:', error)
        res.status(500).json({ error: 'Failed to add team member' })
    }
})

/**
 * Remove member from team
 * DELETE /api/teams/:id/members/:userId
 */
router.delete('/:id/members/:targetUserId', async (req, res) => {
    try {
        const requesterId = (req as any).userId
        const { id, targetUserId } = req.params

        // Verify requester is OWNER or ADMIN (or removing themselves)
        const requesterRole = await prisma.teamMember.findFirst({
            where: { teamId: id, userId: requesterId }
        })

        if (!requesterRole) return res.status(403).json({ error: 'Unauthorized' })

        if (requesterId !== targetUserId && !['OWNER', 'ADMIN'].includes(requesterRole.role)) {
            return res.status(403).json({ error: 'Unauthorized to remove members' })
        }

        // If target is OWNER, check if there's another OWNER? Or just prevent?
        if (targetUserId === requesterId && requesterRole.role === 'OWNER') {
            const ownerCount = await prisma.teamMember.count({
                where: { teamId: id, role: 'OWNER' }
            })
            if (ownerCount <= 1) {
                return res.status(400).json({ error: 'Cannot remove the last owner' })
            }
        }

        await prisma.teamMember.delete({
            where: {
                teamId_userId: {
                    teamId: id,
                    userId: targetUserId
                }
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'TEAM_MEMBER_REMOVED',
                resourceType: 'TEAM',
                resourceId: id,
                details: JSON.stringify({ removedUserId: targetUserId })
            }
        })

        res.json({ success: true })
    } catch (error: any) {
        console.error('Remove team member error:', error)
        res.status(500).json({ error: 'Failed to remove team member' })
    }
})

/**
 * Update team details
 * PUT /api/teams/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const requesterId = (req as any).userId
        const { id } = req.params
        const { name, description } = createTeamSchema.partial().parse(req.body)

        // Verify requester is OWNER or ADMIN
        const member = await prisma.teamMember.findFirst({
            where: {
                teamId: id,
                userId: requesterId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Unauthorized to update team' })
        }

        const team = await prisma.team.update({
            where: { id },
            data: { name, description }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'TEAM_UPDATED',
                resourceType: 'TEAM',
                resourceId: id,
                details: JSON.stringify({ name, description })
            }
        })

        res.json({ team })
    } catch (error: any) {
        console.error('Update team error:', error)
        res.status(400).json({ error: error.message || 'Failed to update team' })
    }
})

/**
 * Delete team
 * DELETE /api/teams/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const requesterId = (req as any).userId
        const { id } = req.params

        // Verify requester is OWNER
        const member = await prisma.teamMember.findFirst({
            where: {
                teamId: id,
                userId: requesterId,
                role: 'OWNER'
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Only owners can delete teams' })
        }

        await prisma.team.delete({
            where: { id }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'TEAM_DELETED',
                resourceType: 'TEAM',
                resourceId: id
            }
        })

        res.json({ success: true })
    } catch (error: any) {
        console.error('Delete team error:', error)
        res.status(500).json({ error: 'Failed to delete team' })
    }
})

/**
 * Update team security policy
 * PUT /api/teams/:id/policy
 */
router.put('/:id/policy', async (req, res) => {
    try {
        const requesterId = (req as any).userId
        const { id } = req.params

        // Verify requester is OWNER or ADMIN
        const member = await prisma.teamMember.findFirst({
            where: {
                teamId: id,
                userId: requesterId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Unauthorized to update policy' })
        }

        const policySchema = z.object({
            minPasswordLength: z.number().min(8).max(128).optional(),
            requireUppercase: z.boolean().optional(),
            requireLowercase: z.boolean().optional(),
            requireNumbers: z.boolean().optional(),
            requireSymbols: z.boolean().optional(),
            twoFactorRequired: z.boolean().optional(),
            autoLockTimeout: z.number().min(1).max(1440).optional(),
        })

        const updates = policySchema.parse(req.body)

        const policy = await prisma.teamPolicy.upsert({
            where: { teamId: id },
            update: updates,
            create: {
                ...updates,
                teamId: id
            }
        })

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'TEAM_POLICY_UPDATED',
                resourceType: 'TEAM',
                resourceId: id,
                details: JSON.stringify(updates)
            }
        })

        res.json({ policy })
    } catch (error: any) {
        console.error('Update policy error:', error)
        res.status(400).json({ error: error.message || 'Failed to update policy' })
    }
})

export default router
