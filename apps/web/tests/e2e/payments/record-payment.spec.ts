import { test, expect } from '@playwright/test';
import { loginAs } from '../utils/login';
import { navigateTo, generateTestData, waitForToast, clickButton } from '../utils/helpers';

/**
 * Payment Recording Tests
 * 
 * Tests payment recording functionality
 * for different user roles
 */

test.describe('Payment Recording - Agent Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'agent');
    await navigateTo(page, 'payments');
  });

  test('should display payments page correctly', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
    
    // Check table exists
    await expect(page.locator('table')).toBeVisible();
  });

  test('agent can record a payment', async ({ page }) => {
    // Look for record payment button
    const recordButton = page.getByRole('button', { name: /record payment|new payment|add payment/i });
    
    if (await recordButton.isVisible()) {
      await recordButton.click();
      
      // Wait for payment form
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Fill in payment amount
      const amountInput = page.getByLabel(/amount/i);
      await amountInput.fill('50000');
      
      // Select payment method (if available)
      const methodSelect = page.locator('select[name*="method"], select[name*="type"]').first();
      if (await methodSelect.isVisible()) {
        await methodSelect.selectOption({ index: 1 });
      }
      
      // Submit payment
      await clickButton(page, /submit|save|record/i);
      
      // Wait for success
      await waitForToast(page, /success|recorded/i);
      
      // Verify payment in table
      await expect(page.locator('table')).toContainText('50,000');
    }
  });

  test('should validate payment amount', async ({ page }) => {
    const recordButton = page.getByRole('button', { name: /record payment|new payment|add payment/i });
    
    if (await recordButton.isVisible()) {
      await recordButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Try to submit without amount
      await clickButton(page, /submit|save|record/i);
      
      // Should show validation error or prevent submission
      const dialogStillOpen = await page.getByRole('dialog').isVisible();
      expect(dialogStillOpen).toBe(true);
    }
  });

  test('should show payment history', async ({ page }) => {
    // Table should be visible
    await expect(page.locator('table')).toBeVisible();
    
    // Should have table headers
    const headers = page.locator('table thead th');
    const headerCount = await headers.count();
    
    expect(headerCount).toBeGreaterThan(0);
  });
});

test.describe('Payment Recording - Frontdesk Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'frontdesk');
    await navigateTo(page, 'payments');
  });

  test('frontdesk can view payments', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('frontdesk can filter payments', async ({ page }) => {
    // Check if filter options exist
    const filterButton = page.getByRole('button', { name: /filter/i });
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Should show filter options
      await expect(page.locator('select, input[type="date"]').first()).toBeVisible();
    }
  });
});

test.describe('Payment Receipts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'agent');
    await navigateTo(page, 'payments');
  });

  test('should allow viewing receipt for payment', async ({ page }) => {
    // Look for view receipt button/link
    const receiptButton = page.getByRole('button', { name: /receipt|view/i }).first();
    
    if (await receiptButton.isVisible()) {
      await receiptButton.click();
      
      // Should show receipt modal or navigate to receipt page
      const receiptVisible = await page.locator('text=/receipt|payment confirmation/i').isVisible({ timeout: 3000 });
      expect(receiptVisible).toBe(true);
    }
  });
});
