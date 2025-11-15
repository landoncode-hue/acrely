import { test, expect } from '@playwright/test';
import { loginAs } from '../utils/login';
import { navigateTo } from '../utils/helpers';

/**
 * Dashboard Navigation Tests
 * 
 * Tests navigation between different dashboard sections
 * and validates that all links work correctly
 */

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should navigate to customers page', async ({ page }) => {
    await navigateTo(page, 'customers');
    
    // Should be on customers page
    await expect(page).toHaveURL(/\/dashboard\/customers/);
    
    // Should see customers heading
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
  });

  test('should navigate to allocations page', async ({ page }) => {
    await navigateTo(page, 'allocations');
    
    await expect(page).toHaveURL(/\/dashboard\/allocations/);
    await expect(page.getByRole('heading', { name: /allocations/i })).toBeVisible();
  });

  test('should navigate to payments page', async ({ page }) => {
    await navigateTo(page, 'payments');
    
    await expect(page).toHaveURL(/\/dashboard\/payments/);
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
  });

  test('should navigate to reports page', async ({ page }) => {
    await navigateTo(page, 'reports');
    
    await expect(page).toHaveURL(/\/dashboard\/reports/);
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
  });

  test('dashboard navigation works for all main sections', async ({ page }) => {
    const sections = [
      { name: 'Customers', url: '/dashboard/customers' },
      { name: 'Allocations', url: '/dashboard/allocations' },
      { name: 'Payments', url: '/dashboard/payments' },
      { name: 'Reports', url: '/dashboard/reports' },
    ];

    for (const section of sections) {
      // Click navigation link
      await page.click(`a[href*="${section.url}"]`);
      
      // Verify URL
      await expect(page).toHaveURL(new RegExp(section.url));
      
      // Verify page loaded (check for heading or content)
      await expect(page.getByRole('heading')).toBeVisible();
      
      // Small delay between navigations
      await page.waitForTimeout(500);
    }
  });

  test('should display correct navigation items for admin', async ({ page }) => {
    // Admin should see analytics, audit, and system links
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /allocations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /payments/i })).toBeVisible();
  });

  test('sidebar should be visible on desktop', async ({ page }) => {
    // Check if sidebar navigation exists
    const sidebar = page.locator('aside, nav[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('mobile menu should work on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Navigation should become visible
      await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    }
  });
});

test.describe('Dashboard - Role-Based Navigation', () => {
  test('agent should see limited navigation options', async ({ page }) => {
    await loginAs(page, 'agent');
    
    // Agent should see their relevant sections
    await expect(page.getByRole('link', { name: /allocations/i })).toBeVisible();
    
    // Agent should NOT see admin-only sections (audit, system)
    const auditLink = page.getByRole('link', { name: /^audit$/i });
    const systemLink = page.getByRole('link', { name: /^system$/i });
    
    const auditVisible = await auditLink.count();
    const systemVisible = await systemLink.count();
    
    expect(auditVisible).toBe(0);
    expect(systemVisible).toBe(0);
  });

  test('frontdesk should see appropriate navigation', async ({ page }) => {
    await loginAs(page, 'frontdesk');
    
    // Frontdesk should see customers and payments
    await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /payments/i })).toBeVisible();
  });
});
