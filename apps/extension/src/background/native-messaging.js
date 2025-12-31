/**
 * Native Messaging Client
 * Handles communication with PassKeyPer desktop app
 */
import browser from 'webextension-polyfill';
const NATIVE_HOST_NAME = 'com.passkeyper.native';
class NativeMessagingClient {
    constructor() {
        this.port = null;
        this.connected = false;
        this.pendingRequests = new Map();
    }
    /**
     * Connect to native messaging host
     */
    connect() {
        if (this.connected)
            return true;
        try {
            this.port = browser.runtime.connectNative(NATIVE_HOST_NAME);
            this.port.onMessage.addListener((response) => {
                this.handleResponse(response);
            });
            this.port.onDisconnect.addListener(() => {
                this.handleDisconnect();
            });
            this.connected = true;
            console.log('✓ Connected to native messaging host');
            return true;
        }
        catch (error) {
            console.error('Failed to connect to native messaging host:', error);
            this.connected = false;
            return false;
        }
    }
    /**
     * Send message to desktop app and wait for response
     */
    async sendMessage(message) {
        if (!this.connected && !this.connect()) {
            throw new Error('Not connected to desktop app. Please ensure PassKeyPer is running.');
        }
        return new Promise((resolve, reject) => {
            const requestId = crypto.randomUUID();
            // Store promise handlers
            this.pendingRequests.set(requestId, { resolve, reject });
            // Send message with ID
            try {
                this.port?.postMessage({
                    ...message,
                    requestId
                });
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId);
                        reject(new Error('Request timeout'));
                    }
                }, 10000);
            }
            catch (error) {
                this.pendingRequests.delete(requestId);
                reject(error);
            }
        });
    }
    /**
     * Handle response from desktop app
     */
    handleResponse(response) {
        const requestId = response.requestId;
        if (!requestId || !this.pendingRequests.has(requestId)) {
            console.warn('Received response for unknown request:', requestId);
            return;
        }
        const { resolve, reject } = this.pendingRequests.get(requestId);
        this.pendingRequests.delete(requestId);
        if (response.success) {
            resolve(response);
        }
        else {
            reject(new Error(response.error || 'Unknown error'));
        }
    }
    /**
     * Handle disconnection
     */
    handleDisconnect() {
        console.log('Disconnected from native messaging host');
        this.connected = false;
        this.port = null;
        // Reject all pending requests
        for (const [id, { reject }] of this.pendingRequests.entries()) {
            reject(new Error('Disconnected from desktop app'));
        }
        this.pendingRequests.clear();
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Disconnect from native host
     */
    disconnect() {
        if (this.port) {
            this.port.disconnect();
        }
        this.connected = false;
        this.port = null;
    }
}
// Singleton instance
export const nativeMessaging = new NativeMessagingClient();
/**
 * Helper functions for common operations
 */
export async function getCredentials(url) {
    try {
        const response = await nativeMessaging.sendMessage({
            type: 'GET_CREDENTIALS',
            payload: { url }
        });
        return response.credentials || [];
    }
    catch (error) {
        console.error('Failed to get credentials:', error);
        return [];
    }
}
export async function saveCredentials(url, username, password) {
    try {
        await nativeMessaging.sendMessage({
            type: 'SAVE_CREDENTIALS',
            payload: { url, username, password }
        });
        return true;
    }
    catch (error) {
        console.error('Failed to save credentials:', error);
        return false;
    }
}
export async function openDesktopApp() {
    try {
        await nativeMessaging.sendMessage({
            type: 'OPEN_APP'
        });
        return true;
    }
    catch (error) {
        console.error('Failed to open desktop app:', error);
        return false;
    }
}
export async function pingDesktop() {
    try {
        const response = await nativeMessaging.sendMessage({
            type: 'PING'
        });
        return response.success;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=native-messaging.js.map