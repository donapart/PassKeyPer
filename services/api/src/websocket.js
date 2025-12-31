/**
 * WebSocket Handler for Real-time Sync
 */
import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
// Store connected clients
const clients = new Map();
export function handleWebSocket(ws, req) {
    console.log('New WebSocket connection');
    // Handle authentication
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            // First message should be authentication
            if (!ws.userId && message.type === 'AUTH') {
                await handleAuth(ws, message.token, message.deviceId);
                return;
            }
            // Require authentication for other messages
            if (!ws.userId) {
                ws.send(JSON.stringify({ type: 'ERROR', error: 'Not authenticated' }));
                return;
            }
            // Handle different message types
            switch (message.type) {
                case 'SYNC_REQUEST':
                    await handleSyncRequest(ws, message);
                    break;
                case 'ITEM_UPDATED':
                    await handleItemUpdate(ws, message);
                    break;
                case 'PING':
                    ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'ERROR', error: 'Unknown message type' }));
            }
        }
        catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({ type: 'ERROR', error: 'Invalid message' }));
        }
    });
    // Handle disconnect
    ws.on('close', () => {
        if (ws.userId) {
            const userClients = clients.get(ws.userId);
            if (userClients) {
                userClients.delete(ws);
                if (userClients.size === 0) {
                    clients.delete(ws.userId);
                }
            }
        }
        console.log('WebSocket client disconnected');
    });
}
async function handleAuth(ws, token, deviceId) {
    try {
        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        // Set user ID
        ws.userId = decoded.userId;
        ws.deviceId = deviceId;
        // Add to clients map
        if (!clients.has(decoded.userId)) {
            clients.set(decoded.userId, new Set());
        }
        clients.get(decoded.userId).add(ws);
        // Send success
        ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            userId: decoded.userId
        }));
        console.log(`User ${decoded.userId} authenticated via WebSocket`);
    }
    catch (error) {
        ws.send(JSON.stringify({ type: 'AUTH_ERROR', error: 'Invalid token' }));
        ws.close();
    }
}
async function handleSyncRequest(ws, message) {
    const { vaultId, lastSyncTimestamp } = message;
    try {
        // Get updates since last sync
        const updates = await prisma.vaultItem.findMany({
            where: {
                vaultId,
                updatedAt: {
                    gt: new Date(lastSyncTimestamp)
                }
            },
            orderBy: {
                updatedAt: 'asc'
            }
        });
        ws.send(JSON.stringify({
            type: 'SYNC_RESPONSE',
            vaultId,
            updates,
            timestamp: Date.now()
        }));
    }
    catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: 'Sync failed'
        }));
    }
}
async function handleItemUpdate(ws, message) {
    const { vaultId, item } = message;
    try {
        // Broadcast to other devices
        broadcastToUser(ws.userId, {
            type: 'ITEM_UPDATED',
            vaultId,
            item
        }, ws); // Exclude sender
        ws.send(JSON.stringify({
            type: 'ITEM_UPDATE_ACK',
            itemId: item.id
        }));
    }
    catch (error) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            error: 'Update broadcast failed'
        }));
    }
}
/**
 * Broadcast message to all user's devices
 */
function broadcastToUser(userId, message, exclude) {
    const userClients = clients.get(userId);
    if (!userClients)
        return;
    const messageStr = JSON.stringify(message);
    userClients.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}
/**
 * Send message to specific user
 */
export function sendToUser(userId, message) {
    broadcastToUser(userId, message);
}
//# sourceMappingURL=websocket.js.map