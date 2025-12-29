/**
 * API Integration Tests
 * Tests all API endpoints
 */

import { describe, test, expect, beforeAll } from 'vitest'

const API_URL = 'http://localhost:3000'
let authToken = ''
let vaultId = ''
let itemId = ''

describe('API Integration Tests', () => {
    describe('Authentication', () => {
        test('POST /api/auth/register - should register new user', async () => {
            console.log('Running Register Test')
            const email = `test${Date.now()}@example.com`
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'hashed-password-verification',
                    authSalt: 'test-salt',
                    publicKey: 'mock-public-key',
                    encryptedPrivateKey: 'mock-encrypted-private-key'
                })
            })

            expect(response.status).toBe(200) // API returns 200 on success, check api.ts if 201? No, res.json() implies 200 default usually
            const data = await response.json()
            expect(data.token).toBeDefined()
            expect(data.user.email).toBe(email)
        })

        test('POST /api/auth/login - should login existing user', async () => {
            // Need to register first or rely on order? 
            // Better to register a dedicated user for login test or re-use.
            // Let's create a fresh user for login to be safe/isolated if possible, 
            // or just use the one from previous test if we track it.
            // But 'test${Date.now()}' changes. 
            // Let's register a specific user for login flow.

            const email = `login${Date.now()}@example.com`
            // Register first
            await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'correct-hash',
                    authSalt: 'salt',
                    publicKey: 'pk',
                    encryptedPrivateKey: 'sk'
                })
            })

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'correct-hash'
                })
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.token).toBeDefined()
            authToken = data.token
            console.log('Login Test: Token set to', authToken)
        })

        test('POST /api/auth/login - should reject wrong password', async () => {
            const email = `wrong${Date.now()}@example.com`
            // Register first
            await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'correct-hash',
                    authSalt: 'salt',
                    publicKey: 'pk',
                    encryptedPrivateKey: 'sk'
                })
            })

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'wrong-hash'
                })
            })

            expect(response.status).toBe(401)
        })
    })

    describe('Vaults', () => {
        beforeAll(async () => {
            // Register and login a user specifically for these tests to ensure we have a token
            const email = `vaults-test-${Date.now()}@example.com`

            await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'hash',
                    authSalt: 'salt',
                    publicKey: 'pk',
                    encryptedPrivateKey: 'sk'
                })
            })

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    authHash: 'hash'
                })
            })

            const data = await response.json()
            authToken = data.token
            console.log('Vaults Setup: Token set to', authToken)
        })

        test('POST /api/vaults - should create vault', async () => {
            const response = await fetch(`${API_URL}/api/vaults`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: 'Test Vault',
                    type: 'personal',
                    encryptedKey: 'mock-encrypted-vault-key'
                })
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.vault.name).toBe('Test Vault')
            vaultId = data.vault.id
        })

        test('GET /api/vaults - should list vaults', async () => {
            const response = await fetch(`${API_URL}/api/vaults`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(Array.isArray(data.vaults)).toBe(true)
            expect(data.vaults.length).toBeGreaterThan(0)
        })

        test('GET /api/vaults/:id - should get vault by ID', async () => {
            const response = await fetch(`${API_URL}/api/vaults/${vaultId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.vault.id).toBe(vaultId)
        })
    })

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
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.vaultId).toBe(vaultId)
            itemId = data.id
        })

        test('GET /api/items/:id - should get item', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.id).toBe(itemId)
        })

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
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.version).toBe(2)
        })

        test('PUT /api/items/:id - should detect conflict on outdated version', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    encryptedData: 'conflict-data',
                    version: 1
                })
            })

            expect(response.status).toBe(409)
            const data = await response.json()
            expect(data.error).toContain('Conflict')
            expect(data.currentVersion).toBe(2)
        })

        test('DELETE /api/items/:id - should delete item', async () => {
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            expect(response.status).toBe(200)
        })
    })

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
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.timestamp).toBeDefined()
            expect(Array.isArray(data.updates)).toBe(true)
        })

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
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(Array.isArray(data.results)).toBe(true)
        })
    })
})
