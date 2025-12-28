/**
 * Sync Routes
 * Synchronization protocol
 */

import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { sendToUser } from '../websocket'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

/**
 * POST /api/sync/pull
 * Pull updates from server
 */
router.post('/pull', async (req, res) => {
    try {
        const { vaultId, lastSyncTimestamp, deviceId } = req.body

        // Verify vault belongs to user
        const vault = await prisma.vault.findFirst({
            where: {
                id: vaultId,
                userId: req.userId!
            }
        })

        if (!vault) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        // Get items updated since last sync
        const updates = await prisma.vaultItem.findMany({
            where: {
                vaultId,
                updatedAt: {
                    gt: new Date(lastSyncTimestamp)
                },
                // Exclude items from this device to avoid loops
                deviceId: deviceId ? { not: deviceId } : undefined
            },
            orderBy: {
                updatedAt: 'asc'
            }
        })

        // Get deleted items
        const deleted = await prisma.vaultItem.findMany({
            where: {
                vaultId,
                deletedAt: {
                    not: null,
                    gt: new Date(lastSyncTimestamp)
                }
            },
            select: { id: true, deletedAt: true }
        })

        res.json({
            updates,
            deleted,
            timestamp: Date.now()
        })
    } catch (error) {
        res.status(500).json({ error: 'Sync pull failed' })
    }
})

/**
 * POST /api/sync/push
 * Push local changes to server
 */
router.post('/push', async (req, res) => {
    try {
        const { vaultId, items, deviceId } = req.body

        // Verify vault
        const vault = await prisma.vault.findFirst({
            where: {
                id: vaultId,
                userId: req.userId!
            }
        })

        if (!vault) {
            return res.status(404).json({ error: 'Vault not found' })
        }

        const results = []

        for (const item of items) {
            try {
                // Check for conflicts
                const existing = await prisma.vaultItem.findUnique({
                    where: { id: item.id }
                })

                if (existing && existing.version > item.version) {
                    // Conflict detected
                    results.push({
                        id: item.id,
                        status: 'conflict',
                        serverVersion: existing.version,
                        clientVersion: item.version
                    })
                    continue
                }

                // Upsert item
                const updated = await prisma.vaultItem.upsert({
                    where: { id: item.id },
                    create: {
                        id: item.id,
                        vaultId,
                        encryptedData: item.encryptedData,
                        version: 1,
                        deviceId
                    },
                    update: {
                        encryptedData: item.encryptedData,
                        version: { increment: 1 },
                        updatedAt: new Date(),
                        deviceId
                    }
                })

                // Log sync
                await prisma.syncLog.create({
                    data: {
                        userId: req.userId!,
                        deviceId: deviceId || 'unknown',
                        vaultId,
                        itemId: item.id,
                        action: existing ? 'update' : 'create',
                        version: updated.version
                    }
                })

                // Broadcast to other devices via WebSocket
                sendToUser(req.userId!, {
                    type: 'ITEM_UPDATED',
                    vaultId,
                    item: updated
                })

                results.push({
                    id: item.id,
                    status: 'success',
                    version: updated.version
                })
            } catch (error) {
                results.push({
                    id: item.id,
                    status: 'error',
                    error: 'Failed to sync item'
                })
            }
        }

        res.json({ results })
    } catch (error) {
        res.status(500).json({ error: 'Sync push failed' })
    }
})

/**
 * GET /api/sync/status
 * Get sync status
 */
router.get('/status', async (req, res) => {
    try {
        const { vaultId } = req.query

        const lastSync = await prisma.syncLog.findFirst({
            where: {
                userId: req.userId!,
                vaultId: vaultId as string
            },
            orderBy: {
                timestamp: 'desc'
            }
        })

        res.json({
            lastSync: lastSync?.timestamp || null,
            status: 'synced'
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sync status' })
    }
})

/**
 * POST /api/sync/resolve
 * Resolve sync conflicts
 */
router.post('/resolve', async (req, res) => {
    try {
        const { itemId, resolution, winningVersion } = req.body

        if (resolution === 'use-server') {
            // Client will use server version, no action needed
            res.json({ success: true })
        } else if (resolution === 'use-client') {
            // Force update with client version
            await prisma.vaultItem.update({
                where: { id: itemId },
                data: {
                    encryptedData: winningVersion.encryptedData,
                    version: { increment: 1 },
                    conflictsWith: null
                }
            })
            res.json({ success: true })
        } else {
            res.status(400).json({ error: 'Invalid resolution' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve conflict' })
    }
})

export default router
