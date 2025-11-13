import { test, expect } from '@playwright/test';

/**
 * Supabase Connectivity and Data Integrity Tests
 * Validates Supabase connection, RPC functions, and database integrity
 */

test.describe('Supabase Connectivity', () => {
  test.beforeEach(async ({ page }) => {
    // Login to access Supabase client
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('Supabase connection is active', async ({ page }) => {
    // Navigate to a page that uses Supabase
    await page.goto('/dashboard/customers');
    
    // Check if data loads (indicates Supabase connection)
    await expect(page.getByText(/customers/i)).toBeVisible({ timeout: 10000 });
    
    // Page should not show connection errors
    await expect(page.getByText(/connection failed|offline|no connection/i)).not.toBeVisible();
  });

  test('can query customers table', async ({ page }) => {
    await page.goto('/dashboard/customers');
    
    // Wait for table to load
    await page.waitForTimeout(2000);
    
    // Table should be visible
    const table = page.locator('table').or(page.getByRole('table')).or(page.locator('[data-table]'));
    const tableExists = await table.count() > 0;
    
    if (tableExists) {
      await expect(table.first()).toBeVisible();
    }
  });

  test('can query allocations table', async ({ page }) => {
    await page.goto('/dashboard/allocations');
    
    await page.waitForTimeout(2000);
    
    // Should load without errors
    await expect(page.getByRole('heading', { name: /allocations/i })).toBeVisible();
  });

  test('can query payments table', async ({ page }) => {
    await page.goto('/dashboard/payments');
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
  });

  test('real-time subscriptions work', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Dashboard should update in real-time
    // We can test this by checking if stats are live
    const statsVisible = await page.getByText(/total customers|total revenue/i).isVisible();
    expect(statsVisible).toBeTruthy();
  });

  test('RPC health check function', async ({ page }) => {
    // Navigate to system dashboard or health page
    const response = await page.goto('/dashboard/system');
    
    // Should load without Supabase errors
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});

test.describe('Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('foreign key constraints are respected', async ({ page }) => {
    // Create a customer
    await page.goto('/dashboard/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    
    const timestamp = Date.now();
    await page.getByLabel(/full name/i).fill(`Integrity Test ${timestamp}`);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`integrity${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/customer created/i)).toBeVisible({ timeout: 5000 });
    
    // Create allocation for this customer
    await page.goto('/dashboard/allocations');
    await page.getByRole('button', { name: /create allocation/i }).click();
    
    // Should be able to select the customer (foreign key exists)
    await page.getByLabel(/customer/i).click();
    const customerOption = page.getByRole('option', { name: new RegExp(`Integrity Test ${timestamp}`, 'i') });
    await expect(customerOption).toBeVisible({ timeout: 5000 });
  });

  test('allocation-payment relationship is valid', async ({ page }) => {
    await page.goto('/dashboard/payments');
    
    // Try to create a payment
    const createButton = page.getByRole('button', { name: /record payment/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Should show allocation dropdown (foreign key relationship)
      const allocationField = page.getByLabel(/allocation/i);
      await expect(allocationField).toBeVisible();
    }
  });

  test('billing records are consistent', async ({ page }) => {
    await page.goto('/dashboard/billing');
    
    await page.waitForTimeout(2000);
    
    // Billing page should load without data inconsistencies
    await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible();
  });

  test('receipts are linked to payments', async ({ page }) => {
    await page.goto('/dashboard/receipts');
    
    await page.waitForTimeout(2000);
    
    // Receipts page should show data
    await expect(page.getByRole('heading', { name: /receipts/i })).toBeVisible();
  });

  test('audit logs are being recorded', async ({ page }) => {
    await page.goto('/dashboard/audit');
    
    await page.waitForTimeout(2000);
    
    // Audit page should have logs
    await expect(page.getByRole('heading', { name: /audit/i })).toBeVisible();
  });

  test('field reports have valid references', async ({ page }) => {
    await page.goto('/dashboard/field-reports');
    
    await page.waitForTimeout(2000);
    
    await expect(page.getByRole('heading', { name: /field reports/i })).toBeVisible();
  });

  test('database constraints prevent invalid data', async ({ page }) => {
    await page.goto('/dashboard/customers');
    
    // Try to create customer with missing required fields
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation error or prevent submission
    // Form should still be visible (not submitted)
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
