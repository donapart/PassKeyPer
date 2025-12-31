/**
 * WebSocket Handler for Real-time Sync
 */
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
interface AuthenticatedWebSocket extends WebSocket {
    userId?: string;
    deviceId?: string;
}
export declare function handleWebSocket(ws: AuthenticatedWebSocket, req: IncomingMessage): void;
/**
 * Send message to specific user
 */
export declare function sendToUser(userId: string, message: any): void;
export {};
//# sourceMappingURL=websocket.d.ts.map