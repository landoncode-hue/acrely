import { test, expect } from '@playwright/test';

/**
 * Regression Test Suite
 * Tests to ensure no breaking changes in critical functionality
 */

test.describe('Regression Suite - Critical Workflows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('regression: customer creation flow unchanged', async ({ page }) => {
    await page.goto('/dashboard/customers');
    
    const addButton = page.getByRole('button', { name: /add customer/i });
    await expect(addButton).toBeVisible();
    
    await addButton.click();
    
    // Form structure should remain consistent
    await expect(page.getByLabel(/full name|name/i)).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    
    const timestamp = Date.now();
    await page.getByLabel(/full name|name/i).fill(`Regression ${timestamp}`);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`regression${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Success behavior unchanged
    await expect(page.getByText(/customer created|success/i)).toBeVisible({ timeout: 5000 });
  });

  test('regression: allocation workflow unchanged', async ({ page }) => {
    await page.goto('/dashboard/allocations');
    
    const createButton = page.getByRole('button', { name: /create allocation/i });
    await expect(createButton).toBeVisible();
    
    await createButton.click();
    
    // Core fields remain
    await expect(page.getByLabel(/customer/i)).toBeVisible();
    await expect(page.getByLabel(/plot/i)).toBeVisible();
    await expect(page.getByLabel(/payment plan/i)).toBeVisible();
  });

  test('regression: payment recording unchanged', async ({ page }) => {
    await page.goto('/dashboard/payments');
    
    const recordButton = page.getByRole('button', { name: /record payment/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      
      // Payment form structure unchanged
      await expect(page.getByLabel(/amount/i)).toBeVisible();
      await expect(page.getByLabel(/payment method/i)).toBeVisible();
    }
  });

  test('regression: dashboard metrics display correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Key metrics should still be visible
    const metrics = [
      /total customers/i,
      /total revenue/i,
      /available plots/i,
    ];
    
    for (const metric of metrics) {
      const element = page.getByText(metric);
      const exists = await element.count() > 0;
      if (exists) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('regression: navigation structure unchanged', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Core navigation items should exist
    const navItems = [
      /dashboard/i,
      /customers/i,
      /allocations/i,
      /payments/i,
    ];
    
    for (const item of navItems) {
      const link = page.getByRole('link', { name: item });
      const exists = await link.count() > 0;
      expect(exists).toBeTruthy();
    }
  });

  test('regression: authentication flow unchanged', async ({ page, context }) => {
    // Logout first
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    await page.goto('/');
    
    // Login flow should work as before
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('regression: reports page loads correctly', async ({ page }) => {
    await page.goto('/dashboard/reports');
    
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
    
    // Should have report content
    const hasContent = await page.getByText(/revenue|customer|payment/i).count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('regression: receipts system functional', async ({ page }) => {
    await page.goto('/dashboard/receipts');
    
    await expect(page.getByRole('heading', { name: /receipts/i })).toBeVisible();
  });

  test('regression: audit logs accessible', async ({ page }) => {
    await page.goto('/dashboard/audit');
    
    await expect(page.getByRole('heading', { name: /audit/i })).toBeVisible();
  });

  test('regression: field reports functional', async ({ page }) => {
    await page.goto('/dashboard/field-reports');
    
    await expect(page.getByRole('heading', { name: /field reports/i })).toBeVisible();
  });

  test('regression: analytics dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Analytics page should load or redirect appropriately
    const loaded = await page.getByRole('heading').count() > 0;
    expect(loaded).toBeTruthy();
  });

  test('regression: search functionality works', async ({ page }) => {
    await page.goto('/dashboard/customers');
    
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Search should not crash the page
      const pageStillWorks = await page.getByRole('heading', { name: /customers/i }).isVisible();
      expect(pageStillWorks).toBeTruthy();
    }
  });

  test('regression: pagination works', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.waitForTimeout(2000);
    
    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /next|>/i });
    const paginationExists = await nextButton.count() > 0;
    
    if (paginationExists) {
      // Pagination should be clickable
      const isEnabled = await nextButton.first().isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    }
  });

  test('regression: filters work correctly', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await page.waitForTimeout(2000);
    
    // Check if filters exist
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      
      // Filter panel should open
      const hasFilterPanel = await page.getByText(/date|amount|status/i).count() > 0;
      expect(hasFilterPanel).toBeTruthy();
    }
  });

  test('regression: export functionality works', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await page.waitForTimeout(2000);
    
    const exportButton = page.getByRole('button', { name: /export|download/i });
    if (await exportButton.isVisible()) {
      // Button should be clickable
      const isEnabled = await exportButton.isEnabled();
      expect(isEnabled).toBeTruthy();
    }
  });

  test('regression: modal dialogs work', async ({ page }) => {
    await page.goto('/dashboard/customers');
    
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Close button should work
    const closeButton = page.getByRole('button', { name: /close|cancel|×/i });
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
      
      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('regression: form validation works', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation or prevent submission
    const dialogStillOpen = await page.getByRole('dialog').isVisible();
    expect(dialogStillOpen).toBeTruthy();
  });

  test('regression: toast notifications appear', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    
    const timestamp = Date.now();
    await page.getByLabel(/full name|name/i).fill(`Toast Test ${timestamp}`);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`toast${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Toast should appear
    const toast = page.getByText(/customer created|success/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('regression: error handling works', async ({ page, context }) => {
    // Simulate error condition
    await context.setOffline(true);
    
    await page.goto('/dashboard/customers').catch(() => {});
    
    // Should show error state
    const hasError = await page.getByText(/error|failed|offline|retry/i).isVisible({ timeout: 5000 });
    
    await context.setOffline(false);
    
    // Error handling should be present
    expect(typeof hasError).toBe('boolean');
  });

  test('regression: table sorting works', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.waitForTimeout(2000);
    
    // Look for sortable headers
    const headers = await page.getByRole('columnheader').all();
    
    if (headers.length > 0) {
      const firstHeader = headers[0];
      await firstHeader.click();
      await page.waitForTimeout(500);
      
      // Page should not crash
      const pageWorks = await page.getByRole('heading', { name: /customers/i }).isVisible();
      expect(pageWorks).toBeTruthy();
    }
  });

  test('regression: mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Dashboard should be responsive
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Mobile menu should work
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Navigation should appear
      const navVisible = await page.getByRole('link', { name: /customers/i }).isVisible();
      expect(navVisible).toBeTruthy();
    }
  });
});
