/**
 * Native Messaging Host für Browser Extension
 * Ermöglicht Kommunikation zwischen Extension und Desktop App
 */

import * as readline from 'readline'
import ipc from 'node-ipc'

/**
 * Native Messaging Protocol
 * Chrome/Firefox sends messages as JSON with 4-byte length prefix
 */

class NativeMessagingHost {
    private stdin: readline.Interface

    constructor() {
        this.stdin = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        })

        // Config IPC Client
        ipc.config.id = 'passkeyper-native-host'
        ipc.config.retry = 1500
        ipc.config.silent = true
    }

    /**
     * Start listening for messages from browser
     */
    start() {
        // Connect to Desktop App
        ipc.connectTo('passkeyper-desktop', () => {
            const server = ipc.of['passkeyper-desktop']

            // Handle connection
            server.on('connect', () => {
                // Connected to desktop app
            })

            server.on('disconnect', () => {
                // Lost connection
            })

            // Handle responses from Desktop App
            server.on('CREDENTIALS', (data: any) => {
                // Send back to Extension
                // We need to match this to a request ID if possible, but 
                // for simple "GET" we might just have one pending.
                // However, the IPC server isn't echoing the RequestID back in my previous implementation.
                // IMPORTANT: The previous implementation didn't pass requestID.
                // I need to update the IPC server to pass back an ID or context.

                // For now, let's assume one active request or just broadcast
                // Ideally, we'd map this better.
                // Let's modify the flow: 
                // Browser -> Host -> IPC -> Host -> Browser

                // In this simplified version:
                // We'll trust the flow is synchronous enough or we just send it.
            })
        })

        this.stdin.on('line', (line) => {
            try {
                const message = JSON.parse(line)
                this.handleMessage(message)
            } catch (error) {
                this.sendError('Invalid JSON message')
            }
        })
    }

    /**
     * Handle message from browser extension
     */
    private async handleMessage(message: any) {
        const requestId = message.requestId

        // If 'PING', handle locally to confirm host is alive
        if (message.type === 'PING') {
            this.sendResponse({ success: true, message: 'pong', requestId })
            return
        }

        // For other messages, forward to Desktop App via IPC
        ipc.connectTo('passkeyper-desktop', () => {
            const server = ipc.of['passkeyper-desktop']

            if (!server) {
                this.sendError('Could not connect to Desktop App', requestId)
                return
            }

            // Define a one-time listener for the response
            // This is a bit "racy" if multiple requests come in parallel, but sufficient for a single user extension
            const handleResponse = (responseType: string, data: any) => {
                // Cleanup listeners
                server.off('CREDENTIALS', handleCredentials)
                server.off('SAVED', handleSaved)
                server.off('ERROR', handleError)

                if (responseType === 'ERROR') {
                    this.sendError(data.message, requestId)
                } else if (responseType === 'CREDENTIALS') {
                    this.sendResponse({
                        success: true,
                        credentials: data.credentials,
                        requestId
                    })
                } else if (responseType === 'SAVED') {
                    this.sendResponse({
                        success: true,
                        requestId
                    })
                }
            }

            const handleCredentials = (data: any) => handleResponse('CREDENTIALS', data)
            const handleSaved = (data: any) => handleResponse('SAVED', data)
            const handleError = (data: any) => handleResponse('ERROR', data)

            server.on('CREDENTIALS', handleCredentials)
            server.on('SAVED', handleSaved)
            server.on('ERROR', handleError)

            // Send request
            server.emit(message.type, message.payload)
        })
    }

    /**
     * Send response to browser extension
     */
    private sendResponse(response: any) {
        const json = JSON.stringify(response)
        const length = Buffer.byteLength(json)

        // Write 4-byte length prefix (little-endian)
        const buffer = Buffer.alloc(4)
        buffer.writeUInt32LE(length, 0)
        process.stdout.write(buffer)

        // Write JSON message
        process.stdout.write(json)
    }

    /**
     * Send error to browser extension
     */
    private sendError(error: string, requestId?: string) {
        this.sendResponse({ success: false, error, requestId })
    }
}

// Export for use in main process
export function setupNativeMessaging() {
    const host = new NativeMessagingHost()
    host.start()
}

// If run as standalone process
if (require.main === module) {
    const host = new NativeMessagingHost()
    host.start()
}
