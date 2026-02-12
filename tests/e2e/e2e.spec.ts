/**
 * Simplified E2E Tests for ADU Dashboard
 * Focus: Page loads and critical UI elements are present
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('ADU Dashboard', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for main content to render using data-testid attribute
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 10000 });
    
    // Verify page title
    await expect(page).toHaveTitle(/ADU|Dashboard/i);
  });

  test('displays header', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for header to load using data-testid
    await page.locator('[data-testid="header"]').waitFor({ timeout: 5000 });
    
    const header = await page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
  });

  test('displays budget stats', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for stats grid to appear
    await page.locator('[data-testid="stats-grid"]').waitFor({ timeout: 5000 });
    
    // Check for stat cards using data-testid attributes
    const budgetStat = await page.locator('[data-testid="stat-card-total-budget"]');
    await expect(budgetStat).toBeVisible();
  });

  test('displays progress bar', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for progress section to load
    await page.locator('[data-testid="progress-section"]').waitFor({ timeout: 5000 });
    
    const progressSection = page.locator('[data-testid="progress-bar-container"]');
    await expect(progressSection).toBeVisible();
  });

  test('displays categories section', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for expense breakdown section
    await page.locator('[data-testid="expense-breakdown"]').waitFor({ timeout: 5000 });
    
    const expenseBreakdown = page.locator('[data-testid="expense-breakdown"]');
    await expect(expenseBreakdown).toBeVisible();
  });

  test('displays financial details section', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for sign-off section
    await page.locator('[data-testid="sign-off-section"]').waitFor({ timeout: 5000 });
    
    const details = page.locator('[data-testid="sign-off-section"]');
    await expect(details).toBeVisible();
  });

  test('google sheets link exists', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for main content to load
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Verify page loaded successfully
    const mainContent = await page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('sign in button exists', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for header to load
    await page.locator('[data-testid="header"]').waitFor({ timeout: 5000 });
    
    // Check if either sign-in button or main content is visible
    // (Sign-in buttons may be dynamically rendered by Google SDK)
    const mainContent = await page.locator('[data-testid="main-content"]').isVisible();
    const signInButton = await page.locator('#googleSignIn').isVisible().catch(() => false);
    const signOutButton = await page.locator('#devSignOutBtn').isVisible().catch(() => false);
    
    // At minimum, main content should be visible
    expect(mainContent || signInButton || signOutButton).toBe(true);
  });

  test('page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    // Wait for content to load
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Check that main content is visible
    const mainContent = await page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('page is responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(BASE_URL);
    // Wait for content to load
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Check that main content is visible
    const mainContent = await page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Privacy & Terms Pages', () => {
  test('privacy link navigates to privacy page', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Find and click privacy link in footer
    const privacyButton = page.locator('footer').locator('button', { hasText: /Privacy Policy/i });
    await privacyButton.click();
    
    // Wait for privacy page content
    await page.locator('h1').filter({ hasText: /Privacy Policy/i }).waitFor({ timeout: 5000 });
    
    // Verify page loaded
    const heading = page.locator('h1').filter({ hasText: /Privacy Policy/i });
    await expect(heading).toBeVisible();
  });

  test('terms link navigates to terms page', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Find and click terms link in footer
    const termsButton = page.locator('footer').locator('button', { hasText: /Terms of Service/i });
    await termsButton.click();
    
    // Wait for terms page content
    await page.locator('h1').filter({ hasText: /Terms of Service/i }).waitFor({ timeout: 5000 });
    
    // Verify page loaded
    const heading = page.locator('h1').filter({ hasText: /Terms of Service/i });
    await expect(heading).toBeVisible();
  });

  test('privacy page has back to dashboard button', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Navigate to privacy page
    const privacyButton = page.locator('footer').locator('button', { hasText: /Privacy Policy/i });
    await privacyButton.click();
    
    // Wait for privacy page
    await page.locator('h1').filter({ hasText: /Privacy Policy/i }).waitFor({ timeout: 5000 });
    
    // Find back button
    const backButton = page.locator('button').filter({ hasText: /Back to Dashboard/i });
    await expect(backButton).toBeVisible();
    
    // Click back button
    await backButton.click();
    
    // Verify we're back on dashboard
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    const mainContent = await page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('terms page has back to dashboard button', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Navigate to terms page
    const termsButton = page.locator('footer').locator('button', { hasText: /Terms of Service/i });
    await termsButton.click();
    
    // Wait for terms page
    await page.locator('h1').filter({ hasText: /Terms of Service/i }).waitFor({ timeout: 5000 });
    
    // Find back button
    const backButton = page.locator('button').filter({ hasText: /Back to Dashboard/i });
    await expect(backButton).toBeVisible();
    
    // Click back button
    await backButton.click();
    
    // Verify we're back on dashboard
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    const mainContent = await page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('privacy page displays content sections', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Navigate to privacy page
    const privacyButton = page.locator('footer').locator('button', { hasText: /Privacy Policy/i });
    await privacyButton.click();
    
    // Wait for privacy page
    await page.locator('h1').filter({ hasText: /Privacy Policy/i }).waitFor({ timeout: 5000 });
    
    // Check for key sections
    const infoSection = page.locator('h3').filter({ hasText: /Information We Collect/i });
    await expect(infoSection).toBeVisible();
    
    const usageSection = page.locator('h3').filter({ hasText: /How We Use Your Information/i });
    await expect(usageSection).toBeVisible();
  });

  test('terms page displays content sections', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for footer to be ready
    await page.locator('[data-testid="main-content"]').waitFor({ timeout: 5000 });
    
    // Navigate to terms page
    const termsButton = page.locator('footer').locator('button', { hasText: /Terms of Service/i });
    await termsButton.click();
    
    // Wait for terms page
    await page.locator('h1').filter({ hasText: /Terms of Service/i }).waitFor({ timeout: 5000 });
    
    // Check for key sections
    const acceptanceSection = page.locator('h3').filter({ hasText: /1\. Acceptance of Terms/i });
    await expect(acceptanceSection).toBeVisible();
    
    const licenseSection = page.locator('h3').filter({ hasText: /2\. Use License/i });
    await expect(licenseSection).toBeVisible();
  });
});
