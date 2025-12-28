/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            userId?: string
            deviceId?: string
        }
    }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

        // Set userId on request
        req.userId = decoded.userId

        // Optional device ID from header
        req.deviceId = req.headers['x-device-id'] as string

        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
}
