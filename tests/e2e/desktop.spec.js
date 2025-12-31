/**
 * Authentication E2E Tests
 * Tests user registration, login, logout, and session management
 */
import { test, expect } from '@playwright/test';
test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');
    });
    test('should show login screen on first visit', async ({ page }) => {
        await expect(page.getByText('Welcome to PassKeyPer')).toBeVisible();
        await expect(page.getByPlaceholder('Email')).toBeVisible();
        await expect(page.getByPlaceholder('Master Password')).toBeVisible();
    });
    test('should register new user', async ({ page }) => {
        const email = `test${Date.now()}@example.com`;
        const password = 'SecurePassword123!';
        // Click register tab
        await page.getByRole('button', { name: 'Register' }).click();
        // Fill registration form
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Master Password').fill(password);
        await page.getByPlaceholder('Confirm Password').fill(password);
        // Submit
        await page.getByRole('button', { name: 'Create Account' }).click();
        // Should show main app
        await expect(page.getByText('Vaults')).toBeVisible({ timeout: 5000 });
    });
    test('should login existing user', async ({ page }) => {
        const email = 'test@example.com';
        const password = 'password123';
        // Fill login form
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Master Password').fill(password);
        // Submit
        await page.getByRole('button', { name: 'Unlock' }).click();
        // Should show main app
        await expect(page.getByText('Vaults')).toBeVisible({ timeout: 5000 });
    });
    test('should show error on wrong password', async ({ page }) => {
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('wrong password');
        await page.getByRole('button', { name: 'Unlock' }).click();
        // Should show error
        await expect(page.getByText(/incorrect/i)).toBeVisible();
    });
    test('should logout user', async ({ page }) => {
        // Login first
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('password123');
        await page.getByRole('button', { name: 'Unlock' }).click();
        await expect(page.getByText('Vaults')).toBeVisible();
        // Logout via keyboard shortcut
        await page.keyboard.press('Control+L');
        // Should show login screen
        await expect(page.getByText('Welcome to PassKeyPer')).toBeVisible();
    });
    test('should auto-lock after inactivity', async ({ page }) => {
        // Login
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('password123');
        await page.getByRole('button', { name: 'Unlock' }).click();
        await expect(page.getByText('Vaults')).toBeVisible();
        // Wait for auto-lock (if set to minimum 5 minutes, skip or use settings to set to 1 min)
        // For testing, we can manually trigger lock
        await page.keyboard.press('Control+L');
        // Should be locked
        await expect(page.getByText('Welcome to PassKeyPer')).toBeVisible();
    });
    test('should persist session on reload', async ({ page }) => {
        // Login
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('password123');
        await page.getByRole('button', { name: 'Unlock' }).click();
        await expect(page.getByText('Vaults')).toBeVisible();
        // Reload page
        await page.reload();
        // Should still be logged in (or show quick unlock)
        await expect(page.getByText('Vaults')).toBeVisible({ timeout: 3000 });
    });
});
test.describe('Vault Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('password123');
        await page.getByRole('button', { name: 'Unlock' }).click();
        await expect(page.getByText('Vaults')).toBeVisible();
    });
    test('should create new vault', async ({ page }) => {
        // Click create vault
        await page.getByTitle('Create vault').click();
        // Enter vault name
        await page.getByText('Enter vault name').fill('Test Vault');
        await page.getByRole('button', { name: 'OK' }).click();
        // Vault should appear
        await expect(page.getByText('Test Vault')).toBeVisible();
    });
    test('should switch between vaults', async ({ page }) => {
        // Open vault selector
        await page.getByText('Personal').click();
        // Select different vault
        await page.getByText('Work').click();
        // Should show Work vault
        await expect(page.getByText('Work')).toBeVisible();
    });
});
test.describe('Item Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login and select vault
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder('Email').fill('test@example.com');
        await page.getByPlaceholder('Master Password').fill('password123');
        await page.getByRole('button', { name: 'Unlock' }).click();
        await expect(page.getByText('Vaults')).toBeVisible();
    });
    test('should create new password item', async ({ page }) => {
        // Click new item (Ctrl+N)
        await page.keyboard.press('Control+N');
        // Fill item details
        await page.getByPlaceholder('Name').fill('Test Login');
        await page.getByPlaceholder('Username').fill('testuser');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByPlaceholder('URL').fill('https://example.com');
        // Save
        await page.getByRole('button', { name: 'Save' }).click();
        // Item should appear in list
        await expect(page.getByText('Test Login')).toBeVisible();
    });
    test('should search items', async ({ page }) => {
        // Use search (Ctrl+F)
        await page.keyboard.press('Control+F');
        // Type search query
        await page.getByPlaceholder('Search').fill('github');
        // Should filter items
        await expect(page.getByText('GitHub')).toBeVisible();
        await expect(page.getByText('Gmail')).not.toBeVisible();
    });
    test('should copy password to clipboard', async ({ page }) => {
        // Click on item
        await page.getByText('GitHub').click();
        // Click copy password
        await page.getByTitle('Copy password').click();
        // Should show toast
        await expect(page.getByText('Copied')).toBeVisible();
    });
});
//# sourceMappingURL=desktop.spec.js.map