/**
 * Native Messaging Client
 * Handles communication with PassKeyPer desktop app
 */
export interface NativeMessage {
    type: string;
    payload?: any;
}
export interface NativeResponse {
    success: boolean;
    error?: string;
    [key: string]: any;
}
declare class NativeMessagingClient {
    private port;
    private connected;
    private pendingRequests;
    /**
     * Connect to native messaging host
     */
    connect(): boolean;
    /**
     * Send message to desktop app and wait for response
     */
    sendMessage(message: NativeMessage): Promise<NativeResponse>;
    /**
     * Handle response from desktop app
     */
    private handleResponse;
    /**
     * Handle disconnection
     */
    private handleDisconnect;
    /**
     * Check if connected
     */
    isConnected(): boolean;
    /**
     * Disconnect from native host
     */
    disconnect(): void;
}
export declare const nativeMessaging: NativeMessagingClient;
/**
 * Helper functions for common operations
 */
export declare function getCredentials(url: string): Promise<any>;
export declare function saveCredentials(url: string, username: string, password: string): Promise<boolean>;
export declare function openDesktopApp(): Promise<boolean>;
export declare function pingDesktop(): Promise<boolean>;
export {};
//# sourceMappingURL=native-messaging.d.ts.map