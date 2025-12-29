/**
 * PassKeyPer API Server
 * REST API + WebSocket for cloud sync
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'

// Import routes
import authRouter from './routes/auth'
import vaultsRouter from './routes/vaults'
import itemsRouter from './routes/items'
import syncRouter from './routes/sync'
import sharingRouter from './routes/sharing'
import devicesRouter from './routes/devices'

// Import WebSocket handler
import { handleWebSocket } from './websocket'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet()) // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
})
app.use('/api/', limiter)

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/vaults', vaultsRouter)
app.use('/api/items', itemsRouter)
app.use('/api/sync', syncRouter)
app.use('/api/sharing', sharingRouter)
app.use('/api/devices', devicesRouter)

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    })
})

// Create HTTP server
const server = createServer(app)

// WebSocket server for real-time sync
const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected')
    handleWebSocket(ws, req)
})

// Start server
server.listen(PORT, () => {
    console.log(`🚀 PassKeyPer API Server running on port ${PORT}`)
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
})

export default app
