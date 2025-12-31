/**
 * API Integration Tests
 * Tests all API endpoints
 */
import { describe, test, expect, beforeAll } from 'vitest';
const API_URL = 'http://localhost:3000';
let authToken = '';
let vaultId = '';
let itemId = '';
describe('API Integration Tests', () => {
    describe('Authentication', () => {
        test('POST /api/auth/register - should register new user', async () => {
            const email = `test${Date.now()}@example.com`;
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: 'SecurePassword123!',
                    salt: 'test-salt'
                })
            });
            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.token).toBeDefined();
            expect(data.user.email).toBe(email);
        });
        test('POST /api/auth/login - should login existing user', async () => {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.token).toBeDefined();
            authToken = data.token;
        });
        test('POST /api/auth/login - should reject wrong password', async () => {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
            });
            expect(response.status).toBe(401);
        });
    });
    describe('Vaults', () => {
        beforeAll(() => {
            // Ensure we have auth token from previous tests
            if (!authToken) {
                throw new Error('No auth token available');
            }
        });
        test('POST /api/vaults - should create vault', async () => {
            const response = await fetch(`${API_URL}/api/vaults`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: 'Test Vault',
                    type: 'personal'
                })
            });
            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.name).toBe('Test Vault');
            vaultId = data.id;
        });
        test('GET /api/vaults - should list vaults', async () => {
            const response = await fetch(`${API_URL}/api/vaults`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data.vaults)).toBe(true);
            expect(data.vaults.length).toBeGreaterThan(0);
        });
        test('GET /api/vaults/:id - should get vault by ID', async () => {
            const response = await fetch(`${API_URL}/api/vaults/${vaultId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.id).toBe(vaultId);
        });
    });
    describe('Items', () => {
        test('POST /api/items - should create item', async () => {
            const response = await fetch(`${API_URL}/api/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    vaultId,
                    type: 'password',
                    encryptedData: 'encrypted-data-here',
                    metadata: { name: 'Test Item' }
                })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.vaultId).toBe(vaultId);
            itemId = data.id;
        });
        test('GET /api/items/:id - should get item', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.id).toBe(itemId);
        });
        test('PUT /api/items/:id - should update item', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    encryptedData: 'updated-encrypted-data',
                    version: 1
                })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.version).toBe(2);
        });
        test('PUT /api/items/:id - should detect conflict on outdated version', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    encryptedData: 'conflict-data',
                    version: 1 // Old version, current is 2
                })
            });
            expect(response.status).toBe(409);
            const data = await response.json();
            expect(data.error).toContain('Conflict');
            expect(data.currentVersion).toBe(2);
        });
        test('DELETE /api/items/:id - should delete item', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            expect(response.status).toBe(200);
        });
    });
    describe('Sync', () => {
        test('POST /api/sync/pull - should pull updates', async () => {
            const response = await fetch(`${API_URL}/api/sync/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    vaultId,
                    lastSyncTimestamp: 0,
                    deviceId: 'test-device'
                })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.timestamp).toBeDefined();
            expect(Array.isArray(data.updates)).toBe(true);
        });
        test('POST /api/sync/push - should push changes', async () => {
            const response = await fetch(`${API_URL}/api/sync/push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    vaultId,
                    items: [],
                    deviceId: 'test-device'
                })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data.results)).toBe(true);
        });
    });
});
//# sourceMappingURL=api.test.js.map