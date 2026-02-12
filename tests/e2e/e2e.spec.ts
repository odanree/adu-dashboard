/**
 * Simplified E2E Tests for ADU Dashboard
 * Focus: Page loads and critical UI elements are present
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://adu-dashboard.vercel.app';

test.describe('ADU Dashboard', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.stats', { timeout: 10000 });
    
    // Verify page title
    await expect(page).toHaveTitle(/ADU|Dashboard/i);
  });

  test('displays header', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('h1', { timeout: 5000 });
    
    const heading = await page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('displays budget stats', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.stats', { timeout: 5000 });
    
    const statLabels = await page.locator('.stat-label').all();
    expect(statLabels.length).toBeGreaterThan(0);
    
    // Should have "Total Budget", "Amount Spent", etc.
    const textContent = await page.locator('.stats').textContent();
    expect(textContent).toContain('Budget');
  });

  test('displays progress bar', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.progress-bar-container', { timeout: 5000 });
    
    const progressBar = page.locator('.progress-bar-container');
    await expect(progressBar).toBeVisible();
  });

  test('displays categories section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.categories', { timeout: 5000 });
    
    const categoriesSection = page.locator('.categories');
    await expect(categoriesSection).toBeVisible();
  });

  test('displays financial details section', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#detailsTotals', { timeout: 5000 });
    
    const details = page.locator('#detailsTotals');
    await expect(details).toBeVisible();
  });

  test('google sheets link exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.stats', { timeout: 5000 });
    
    // Check that the element exists (may be hidden when unsigned)
    const link = page.locator('#signOffLink');
    const elementHandle = await link.elementHandle().catch(() => null);
    expect(elementHandle).not.toBeNull();
  });

  test('sign in button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for either google sign-in or dev sign-out button
    await page.waitForSelector('#googleSignIn, #devSignOutBtn', { timeout: 5000 });
    
    const googleDiv = page.locator('#googleSignIn');
    const devBtn = page.locator('#devSignOutBtn');
    
    const googleVisible = await googleDiv.isVisible().catch(() => false);
    const devVisible = await devBtn.isVisible().catch(() => false);
    
    expect(googleVisible || devVisible).toBe(true);
  });

  test('page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    await page.waitForSelector('.stats', { timeout: 5000 });
    
    // Check that content is visible on mobile
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('page is responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(BASE_URL);
    await page.waitForSelector('.stats', { timeout: 5000 });
    
    // Check that content is visible on desktop
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });
});
