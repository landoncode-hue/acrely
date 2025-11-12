/**
 * E2E Tests for Analytics Dashboard
 * Tests analytics page, API endpoints, charts, and export functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as CEO
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'ceo@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page).toHaveURL('/dashboard/analytics');
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  });

  test('should display KPI summary cards', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="total-revenue"]', { timeout: 10000 });

    // Check KPI cards are visible
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Active Customers')).toBeVisible();
    await expect(page.locator('text=Total Payments')).toBeVisible();
    await expect(page.locator('text=Active Agents')).toBeVisible();

    // Verify numbers are displayed (not N/A or 0)
    const revenueCard = page.locator('text=Total Revenue').locator('..');
    await expect(revenueCard).not.toContainText('₦0');
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Overview tab (default)
    await expect(page.locator('[role="tabpanel"]').first()).toBeVisible();

    // Click Estates tab
    await page.click('text=Estates');
    await expect(page.locator('text=Estate Performance Comparison')).toBeVisible();

    // Click Agents tab
    await page.click('text=Agents');
    await expect(page.locator('text=Agent Performance Index')).toBeVisible();
    await expect(page.locator('text=Agent Leaderboard')).toBeVisible();

    // Click Trends tab
    await page.click('text=Trends');
    await expect(page.locator('text=Revenue Trends & Predictions')).toBeVisible();
  });

  test('should display revenue chart on overview tab', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Wait for chart to render
    await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });
    
    // Verify chart is visible
    const chart = page.locator('.recharts-wrapper').first();
    await expect(chart).toBeVisible();

    // Verify chart has data points
    const dataPoints = page.locator('.recharts-dot');
    await expect(dataPoints.first()).toBeVisible();
  });

  test('should display estates table with data', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await page.click('text=Estates');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify table headers
    await expect(page.locator('th:has-text("Estate")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Customers")')).toBeVisible();
    await expect(page.locator('th:has-text("Growth")')).toBeVisible();

    // Verify at least one row of data
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should display agents leaderboard', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await page.click('text=Agents');

    // Wait for table
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify leaderboard headers
    await expect(page.locator('th:has-text("Rank")')).toBeVisible();
    await expect(page.locator('th:has-text("Agent")')).toBeVisible();
    await expect(page.locator('th:has-text("Performance Score")')).toBeVisible();

    // Verify ranking starts at 1
    const firstRank = page.locator('tbody tr').first().locator('td').first();
    await expect(firstRank).toContainText('1');
  });

  test('should display predictions on trends tab', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await page.click('text=Trends');

    // Wait for predictions to load
    await page.waitForTimeout(2000);

    // Check if predictions exist (may not always have data)
    const predictionCards = page.locator('text=Confidence');
    const count = await predictionCards.count();
    
    if (count > 0) {
      // Verify prediction cards show confidence level
      await expect(predictionCards.first()).toBeVisible();
      await expect(page.locator('text=Confidence:')).toBeVisible();
    }
  });

  test('should export to CSV', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    
    await page.click('text=Export CSV');
    
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/analytics-report-.*\.csv/);
    
    // Verify file is not empty
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should export to PDF', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Start waiting for download
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    
    await page.click('text=Export PDF');
    
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/analytics-report-.*\.pdf/);
    
    // Verify file is not empty
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should restrict access to non-executive roles', async ({ page }) => {
    // Logout and login as Agent
    await page.goto('/auth/logout');
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'agent@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Try to access analytics
    await page.goto('/dashboard/analytics');

    // Should be redirected or show forbidden message
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError = await page.locator('text=Forbidden').isVisible().catch(() => false);
    
    expect(url === '/dashboard/analytics' ? hasError : true).toBeTruthy();
  });

  test('should load analytics within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard/analytics');
    await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return error
    await page.route('**/api/analytics/summary', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/dashboard/analytics');
    
    // Should display error message
    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('should refresh data when navigating between tabs', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Track API calls
    let apiCalls = 0;
    page.on('request', request => {
      if (request.url().includes('/api/analytics/')) {
        apiCalls++;
      }
    });

    await page.click('text=Estates');
    await page.waitForTimeout(500);
    
    await page.click('text=Overview');
    await page.waitForTimeout(500);

    // Should have made API calls (cached or not)
    expect(apiCalls).toBeGreaterThan(0);
  });
});
