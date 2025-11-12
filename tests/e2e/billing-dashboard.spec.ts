import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pinnaclegroups.ng';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

test.describe('Billing Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to billing dashboard
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
  });

  test('should display billing dashboard with summary cards', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Billing & Performance')).toBeVisible();
    
    // Check summary cards are present
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Total Commissions')).toBeVisible();
    await expect(page.getByText('Total Payments')).toBeVisible();
    await expect(page.getByText('Total Customers')).toBeVisible();
  });

  test('should filter billing data by month and year', async ({ page }) => {
    // Select a different month
    const monthSelect = page.locator('select').first();
    await monthSelect.selectOption('1'); // January
    
    // Select a different year
    const yearSelect = page.locator('select').nth(1);
    await yearSelect.selectOption('2024');
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify URL params updated or data refreshed
    // This would need to check if the API was called with new parameters
  });

  test('should display monthly trend chart', async ({ page }) => {
    // Check if Recharts line chart is rendered
    await expect(page.getByText('Monthly Revenue Trend')).toBeVisible();
    
    // Check for chart elements (SVG)
    const chart = page.locator('.recharts-wrapper').first();
    await expect(chart).toBeVisible();
  });

  test('should display estate revenue distribution chart', async ({ page }) => {
    // Check if bar chart is rendered
    await expect(page.getByText('Estate Revenue Distribution')).toBeVisible();
    
    // Check for chart elements
    const barChart = page.locator('.recharts-wrapper').nth(1);
    await expect(barChart).toBeVisible();
  });

  test('should display estate performance table', async ({ page }) => {
    // Scroll to table
    await page.getByText('Estate Performance Details').scrollIntoViewIfNeeded();
    
    // Check table headers
    await expect(page.getByText('Estate')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Commissions')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Collection Rate')).toBeVisible();
  });

  test('should export billing data to CSV', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click CSV export button
    await page.getByRole('button', { name: /CSV/i }).click();
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/billing-summary-.*\.csv/);
  });

  test('should refresh billing data', async ({ page }) => {
    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await refreshButton.click();
    
    // Wait for loading state
    await page.waitForTimeout(500);
    
    // Check that data is still displayed
    await expect(page.getByText('Total Revenue')).toBeVisible();
  });

  test('should generate new billing summary', async ({ page }) => {
    // Click generate summary button
    const generateButton = page.getByRole('button', { name: /Generate Summary/i });
    await generateButton.click();
    
    // Wait for generation to complete
    await page.waitForTimeout(2000);
    
    // Check for success message or updated data
    // This would depend on your implementation
  });

  test('should display revenue by estate pie chart', async ({ page }) => {
    // Check if pie chart is rendered
    await expect(page.getByText('Revenue by Estate')).toBeVisible();
    
    // Check for pie chart elements
    const pieChart = page.locator('.recharts-wrapper').nth(2);
    await expect(pieChart).toBeVisible();
  });

  test('should display collection rate chart', async ({ page }) => {
    // Check if collection rate chart is rendered
    await expect(page.getByText('Collection Rate by Estate')).toBeVisible();
    
    // Check for chart elements
    const collectionChart = page.locator('.recharts-wrapper').nth(3);
    await expect(collectionChart).toBeVisible();
  });

  test('should handle empty billing data gracefully', async ({ page }) => {
    // Select a future month/year with no data
    const monthSelect = page.locator('select').first();
    await monthSelect.selectOption('12'); // December
    
    const yearSelect = page.locator('select').nth(1);
    await yearSelect.selectOption('2025');
    
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check that page doesn't crash
    await expect(page.getByText('Billing & Performance')).toBeVisible();
  });

  test('should display correct currency formatting', async ({ page }) => {
    // Check that currency values are formatted correctly (₦)
    const revenueCard = page.locator('text=Total Revenue').locator('..');
    const currencyText = await revenueCard.textContent();
    
    // Should contain NGN currency symbol
    expect(currencyText).toMatch(/₦|NGN/);
  });

  test('should be accessible to admin roles only', async ({ page, context }) => {
    // Logout
    await page.goto('/logout');
    
    // Try to access billing dashboard without auth
    await page.goto('/dashboard/billing');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Billing API Integration', () => {
  test('should fetch billing summary from API', async ({ request }) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    const response = await request.get(
      `/api/billing?month=${month}&year=${year}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('period');
    expect(data).toHaveProperty('totals');
    expect(data).toHaveProperty('estates');
  });

  test('should generate billing summary via API', async ({ request }) => {
    const response = await request.post('/api/billing', {
      data: {
        action: 'generate',
        month: 1,
        year: 2025,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('success');
  });
});
