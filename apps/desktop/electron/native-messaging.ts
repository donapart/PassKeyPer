/**
 * Native Messaging Host für Browser Extension
 * Ermöglicht Kommunikation zwischen Extension und Desktop App
 */

import { ipcMain } from 'electron'
import * as readline from 'readline'

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
    }

    /**
     * Start listening for messages from browser
     */
    start() {
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
        console.log('Received message from extension:', message.type)

        const requestId = message.requestId

        switch (message.type) {
            case 'PING':
                this.sendResponse({ success: true, message: 'pong', requestId })
                break

            case 'GET_CREDENTIALS':
                await this.handleGetCredentials(message.payload, requestId)
                break

            case 'SAVE_CREDENTIALS':
                await this.handleSaveCredentials(message.payload, requestId)
                break

            case 'OPEN_APP':
                await this.handleOpenApp(requestId)
                break

            default:
                this.sendError('Unknown message type', requestId)
        }
    }

    private async handleGetCredentials(payload: { url: string }, requestId: string) {
        // TODO: Get credentials from vault
        // For now, return mock data
        this.sendResponse({
            success: true,
            credentials: [
                {
                    id: '1',
                    name: 'GitHub',
                    username: 'user@example.com',
                    url: 'https://github.com'
                }
            ],
            requestId
        })
    }

    private async handleSaveCredentials(payload: any, requestId: string) {
        // TODO: Save to vault
        this.sendResponse({ success: true, requestId })
    }

    private async handleOpenApp(requestId: string) {
        // TODO: Focus main window
        this.sendResponse({ success: true, requestId })
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
