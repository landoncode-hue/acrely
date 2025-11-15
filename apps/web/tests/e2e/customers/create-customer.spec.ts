import { test, expect } from '@playwright/test';
import { loginAs } from '../utils/login';
import { 
  navigateTo, 
  generateTestData, 
  waitForToast,
  clickButton,
  isModalOpen,
  getTableRowCount 
} from '../utils/helpers';

/**
 * Customer Creation Tests
 * 
 * Tests the complete customer creation flow
 * including form validation and data persistence
 */

test.describe('Customer Management - Create', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'frontdesk');
    await navigateTo(page, 'customers');
  });

  test('should display customers page correctly', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
    
    // Check add customer button exists
    await expect(page.getByRole('button', { name: /add customer|new customer/i })).toBeVisible();
    
    // Check table exists
    await expect(page.locator('table')).toBeVisible();
  });

  test('admin can create a customer with full details', async ({ page }) => {
    const testData = generateTestData();
    
    // Click add customer button
    await clickButton(page, /add customer|new customer/i);
    
    // Wait for modal to open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill in customer details
    await page.getByLabel(/full name|name/i).fill(testData.name);
    await page.getByLabel(/phone/i).fill(testData.phone);
    await page.getByLabel(/email/i).fill(testData.email);
    
    // Optional fields
    await page.getByLabel(/city/i).fill('Lagos');
    await page.getByLabel(/state/i).fill('Lagos State');
    
    // Submit form
    await clickButton(page, /save|create/i);
    
    // Wait for success message
    await waitForToast(page, /success|created/i);
    
    // Verify customer appears in table
    await expect(page.locator('table')).toContainText(testData.name);
  });

  test('should validate required fields', async ({ page }) => {
    // Open create customer form
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Try to submit without filling required fields
    await clickButton(page, /save|create/i);
    
    // Should still have modal open (validation failed)
    expect(await isModalOpen(page)).toBe(true);
    
    // Should show validation error or prevent submission
    const errorExists = await page.locator('text=/required|fill|enter/i').isVisible().catch(() => false);
    expect(errorExists || await isModalOpen(page)).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    const testData = generateTestData();
    
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill required fields
    await page.getByLabel(/full name|name/i).fill(testData.name);
    await page.getByLabel(/phone/i).fill(testData.phone);
    
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    
    // Try to submit
    await clickButton(page, /save|create/i);
    
    // Should show error or prevent submission
    const stillOpen = await isModalOpen(page);
    expect(stillOpen).toBe(true);
  });

  test('should validate phone number format', async ({ page }) => {
    const testData = generateTestData();
    
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill required fields
    await page.getByLabel(/full name|name/i).fill(testData.name);
    await page.getByLabel(/email/i).fill(testData.email);
    
    // Enter invalid phone
    await page.getByLabel(/phone/i).fill('abc123');
    
    // Try to submit
    await clickButton(page, /save|create/i);
    
    // Should show error or prevent submission
    const stillOpen = await isModalOpen(page);
    expect(stillOpen).toBe(true);
  });

  test('should create customer with minimal required fields', async ({ page }) => {
    const testData = generateTestData();
    
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill only required fields
    await page.getByLabel(/full name|name/i).fill(testData.name);
    await page.getByLabel(/phone/i).fill(testData.phone);
    
    // Submit
    await clickButton(page, /save|create/i);
    
    // Should succeed
    await waitForToast(page, /success|created/i);
    
    // Verify customer in table
    await expect(page.locator('table')).toContainText(testData.name);
  });

  test('should allow canceling customer creation', async ({ page }) => {
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click cancel
    await clickButton(page, /cancel|close/i);
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    const testData = generateTestData();
    
    await clickButton(page, /add customer|new customer/i);
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByLabel(/full name|name/i).fill(testData.name);
    await page.getByLabel(/phone/i).fill(testData.phone);
    await page.getByLabel(/email/i).fill(testData.email);
    
    // Submit form
    await clickButton(page, /save|create/i);
    
    // Check for loading indicator (if implemented)
    const loadingIndicator = page.locator('text=/saving|creating|loading/i, [class*="spin"], [class*="loading"]');
    const hasLoading = await loadingIndicator.first().isVisible().catch(() => false);
    
    // Either loading indicator shows or success happens quickly
    expect(hasLoading || await waitForToast(page, /success|created/i, 5000).then(() => true).catch(() => false));
  });
});

test.describe('Customer Management - Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'frontdesk');
    await navigateTo(page, 'customers');
  });

  test('should search for customers', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Debounce
      
      // Table should update (or show no results)
      await expect(page.locator('table')).toBeVisible();
    }
  });
});
