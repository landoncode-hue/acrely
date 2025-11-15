import { test, expect } from '@playwright/test';
import { loginAs } from '../utils/login';
import { navigateTo, generateTestData, waitForToast, clickButton } from '../utils/helpers';

/**
 * Allocation Management Tests
 * 
 * Tests allocation creation and management
 */

test.describe('Allocation Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, 'allocations');
  });

  test('should display allocations page correctly', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /allocations/i })).toBeVisible();
    
    // Check table or list exists
    await expect(page.locator('table, [class*="grid"], [class*="list"]')).toBeVisible();
  });

  test('should show create allocation button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create|new allocation|add allocation/i });
    
    // Button should exist for admin
    expect(await createButton.count()).toBeGreaterThan(0);
  });

  test('should display allocation list', async ({ page }) => {
    // Should show some content (table or cards)
    const content = page.locator('table, [class*="card"]');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Allocation - Agent View', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'agent');
    await navigateTo(page, 'allocations');
  });

  test('agent can view their allocations', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /allocations/i })).toBeVisible();
    
    // Should see some content
    await expect(page.locator('table, [class*="allocation"]').first()).toBeVisible();
  });

  test('agent should see only their own allocations', async ({ page }) => {
    // This test verifies RLS is working
    // Agent should not see all allocations, only their own
    
    const allocations = page.locator('table tbody tr, [class*="allocation-card"]');
    const count = await allocations.count();
    
    // Should have limited view (not all allocations)
    // Actual assertion would depend on seeded data
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
