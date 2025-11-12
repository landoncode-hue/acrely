import { test, expect } from '@playwright/test';

/**
 * Customer Management Tests
 * Tests customer CRUD operations and search functionality
 */

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navigate to customers page
    await page.getByRole('link', { name: /customers/i }).click();
    await page.waitForURL('/dashboard/customers');
  });

  test('should display customers list', async ({ page }) => {
    // Verify page loaded
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
    
    // Should show table
    await expect(page.getByRole('table')).toBeVisible();
    
    // Should show search input
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should search customers by name', async ({ page }) => {
    const searchTerm = 'John';
    
    // Type in search box
    await page.getByPlaceholder(/search/i).fill(searchTerm);
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // All visible rows should contain search term
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    
    if (count > 0) {
      const firstRow = rows.first();
      await expect(firstRow).toContainText(searchTerm, { ignoreCase: true });
    }
  });

  test('should open add customer modal', async ({ page }) => {
    // Click add customer button
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/add new customer/i)).toBeVisible();
  });

  test('should create new customer', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Fill form
    const timestamp = Date.now();
    await page.getByLabel(/full name/i).fill(`Test Customer ${timestamp}`);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`customer${timestamp}@test.com`);
    
    // Submit
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/customer created/i)).toBeVisible({ timeout: 5000 });
    
    // Should close modal
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add customer/i }).click();
    
    // Try to submit without filling
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('should view customer details', async ({ page }) => {
    // Click on first customer row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Should show customer details (if implemented)
    // This depends on your UI implementation
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-z0-9-]+/);
  });

  test('should filter customers by status', async ({ page }) => {
    // Check if filter exists
    const filterSelect = page.locator('select[name="status"]');
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('active');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /next/i });
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Should show page 2
      await expect(page.getByText(/page 2/i)).toBeVisible();
    }
  });
});
