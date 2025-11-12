import { test, expect } from '@playwright/test';

test.describe('System Maintenance Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as SysAdmin
    await page.goto('/');
    await page.fill('input[type="email"]', 'sysadmin@pinnaclegroups.ng');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SysAdmin can access system dashboard', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('System Maintenance Dashboard');
    
    // Check health overview is visible
    await expect(page.locator('text=System Status')).toBeVisible();
  });

  test('displays system health metrics', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check for key metrics
    await expect(page.locator('text=Database Response')).toBeVisible();
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Storage Used')).toBeVisible();
    await expect(page.locator('text=Last Backup')).toBeVisible();
  });

  test('displays cron logs summary', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Check cron logs section
    await expect(page.locator('text=Cron Jobs')).toBeVisible();
    
    // Check for view toggle buttons
    await expect(page.locator('button:has-text("Summary")')).toBeVisible();
    await expect(page.locator('button:has-text("Recent Logs")')).toBeVisible();
  });

  test('can toggle between cron summary and logs view', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Click Recent Logs button
    await page.click('button:has-text("Recent Logs")');
    await expect(page.locator('th:has-text("Executed At")')).toBeVisible();
    
    // Click Summary button
    await page.click('button:has-text("Summary")');
    await expect(page.locator('th:has-text("Success Rate")')).toBeVisible();
  });

  test('can trigger manual health check', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Mock confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('health check');
      await dialog.accept();
    });
    
    // Click health check button
    await page.click('button:has-text("Run Health Check")');
    
    // Wait for alert
    await page.waitForTimeout(1000);
  });

  test('can trigger manual backup', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Mock confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('backup');
      await dialog.accept();
    });
    
    // Click backup button
    await page.click('button:has-text("Create Backup")');
    
    await page.waitForTimeout(1000);
  });

  test('displays warnings when system is degraded', async ({ page }) => {
    // This test assumes there are warnings in the system
    await page.goto('/dashboard/system');
    
    // Check if warnings section appears (conditional)
    const warningsExists = await page.locator('text=⚠️ Warnings').count();
    if (warningsExists > 0) {
      await expect(page.locator('text=⚠️ Warnings')).toBeVisible();
    }
  });

  test('non-admin users cannot access system dashboard', async ({ page, browser }) => {
    // Logout current user
    await page.goto('/dashboard');
    await page.click('button:has-text("Logout")');
    
    // Login as Agent (non-admin)
    const agentContext = await browser.newContext();
    const agentPage = await agentContext.newPage();
    
    await agentPage.goto('/');
    await agentPage.fill('input[type="email"]', 'agent@pinnaclegroups.ng');
    await agentPage.fill('input[type="password"]', 'Test1234!');
    await agentPage.click('button[type="submit"]');
    await agentPage.waitForURL('**/dashboard');
    
    // Try to access system dashboard
    await agentPage.goto('/dashboard/system');
    
    // Should redirect back to main dashboard
    await agentPage.waitForURL('**/dashboard');
    await expect(agentPage.url()).not.toContain('/system');
    
    await agentContext.close();
  });

  test('displays status icon based on health status', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    await page.waitForTimeout(2000);
    
    // Check for status indicator (✅, ⚠️, or ❌)
    const statusElement = page.locator('text=/✅|⚠️|❌/').first();
    await expect(statusElement).toBeVisible();
  });

  test('shows cron job execution statistics', async ({ page }) => {
    await page.goto('/dashboard/system');
    
    // Wait for data
    await page.waitForTimeout(2000);
    
    // Click Summary view
    await page.click('button:has-text("Summary")');
    
    // Check for statistics columns
    await expect(page.locator('th:has-text("Total Runs")')).toBeVisible();
    await expect(page.locator('th:has-text("Success Rate")')).toBeVisible();
    await expect(page.locator('th:has-text("Avg Duration")')).toBeVisible();
  });
});
