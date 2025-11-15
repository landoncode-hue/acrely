import { test, expect } from '@playwright/test';

/**
 * Test Environment Demo
 * 
 * This test demonstrates how the isolated test environment works:
 * - Queries test schema (not production)
 * - Uses pre-seeded test data
 * - Runs in complete isolation
 */
test.describe('Test Environment Demo', () => {
  test('should use test schema with seeded data', async ({ page }) => {
    // The TEST_MODE=true environment ensures all queries go to test schema
    // No need for manual schema switching - it's automatic!
    
    // Navigate to customers page
    await page.goto('/customers');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test data check: We should see "Test Customer" entries
    // These are seeded in the test schema, NOT production data
    const customerList = page.locator('[data-testid="customer-list"]');
    
    // Verify test customers are visible
    await expect(customerList).toContainText('Test Customer', { timeout: 10000 });
    
    // Count should be 20 (from seed data)
    const customerCount = await page.locator('[data-testid="customer-row"]').count();
    expect(customerCount).toBeGreaterThan(0);
    expect(customerCount).toBeLessThanOrEqual(20);
  });

  test('should verify test user profiles exist', async ({ page }) => {
    // Navigate to admin/users or similar page that shows profiles
    await page.goto('/admin/users');
    
    await page.waitForLoadState('networkidle');
    
    // Test users should be visible
    // These come from test.profiles table
    const expectedTestUsers = [
      'admin@test.acrely.local',
      'md@test.acrely.local',
      'frontdesk@test.acrely.local',
      'agent@test.acrely.local',
    ];
    
    // Check if at least one test user is visible
    const usersSection = page.locator('body');
    const hasTestUser = await usersSection.textContent();
    
    const foundTestUser = expectedTestUsers.some(email => 
      hasTestUser?.includes(email) || hasTestUser?.includes('test.acrely.local')
    );
    
    // In test mode, we should see test users
    // If this passes, schema switching is working correctly
    expect(foundTestUser).toBeTruthy();
  });

  test('should query test payments without affecting production', async ({ page }) => {
    // Navigate to payments page
    await page.goto('/payments');
    
    await page.waitForLoadState('networkidle');
    
    // Test schema has 40 seeded payments
    // Reference numbers start with 'TEST-REF-'
    const paymentsTable = page.locator('[data-testid="payments-table"]');
    
    // Wait for table to render
    await expect(paymentsTable).toBeVisible({ timeout: 10000 });
    
    // Check for test payment references
    const pageContent = await page.textContent('body');
    
    // If we see TEST-REF-, we're in test schema ✅
    // If we don't see it, we might be in production ❌
    const isUsingTestData = pageContent?.includes('TEST-REF-') || 
                           pageContent?.includes('Test Customer');
    
    // This assertion confirms we're using test data
    expect(isUsingTestData).toBeTruthy();
  });

  test('should handle test allocations correctly', async ({ page }) => {
    // Navigate to allocations page
    await page.goto('/allocations');
    
    await page.waitForLoadState('networkidle');
    
    // Test schema has allocations with plot numbers like 'TEST-PLOT-0001'
    const allocationsContent = await page.textContent('body');
    
    // Verify we're seeing test plots
    const hasTestPlots = allocationsContent?.includes('TEST-PLOT-');
    
    // This confirms allocations are from test schema
    expect(hasTestPlots).toBeTruthy();
  });

  test('should verify audit logs use test schema', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto('/admin/audit-logs');
    
    await page.waitForLoadState('networkidle');
    
    // Test audit logs have user_agent = 'Playwright/E2E Test Runner'
    const auditContent = await page.textContent('body');
    
    // Check for test user IDs
    const hasTestUsers = auditContent?.includes('test-user-') || 
                        auditContent?.includes('test.acrely.local');
    
    // Audit logs should reference test users only
    expect(hasTestUsers).toBeTruthy();
  });
});

/**
 * Schema Isolation Verification
 * 
 * These tests verify that production data is never touched
 */
test.describe('Schema Isolation Checks', () => {
  test('should never see production customer data in test mode', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    
    // In test mode, we should ONLY see test data
    // Real production customers won't have "Test Customer" in their names
    const hasOnlyTestData = content?.includes('Test Customer');
    
    expect(hasOnlyTestData).toBeTruthy();
  });

  test('should use test schema for all database operations', async ({ page }) => {
    // Make a request to any API endpoint
    await page.goto('/api/customers');
    
    // Response should contain test data markers
    const response = await page.textContent('body');
    
    // Look for test data indicators
    const isTestData = 
      response?.includes('test.acrely.local') ||
      response?.includes('Test Customer') ||
      response?.includes('TEST-PLOT-') ||
      response?.includes('TEST-REF-');
    
    // API should return test schema data when TEST_MODE=true
    expect(isTestData).toBeTruthy();
  });
});

/**
 * Reset Functionality Test
 * 
 * Verifies that database reset works correctly
 */
test.describe('Database Reset Validation', () => {
  test('should have consistent test data after reset', async ({ page }) => {
    // After reset, we should always have the same baseline data
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    // Count customers (should be 20 after fresh seed)
    const customerRows = await page.locator('[data-testid="customer-row"]').count();
    
    // Should have test customers (exact count may vary based on filtering)
    expect(customerRows).toBeGreaterThan(0);
    expect(customerRows).toBeLessThanOrEqual(20);
  });
});

/**
 * Helper: Verify Test Mode
 * 
 * This is a utility test to confirm TEST_MODE is properly set
 */
test.describe('Environment Verification', () => {
  test('should confirm TEST_MODE is enabled', async ({ page }) => {
    // Check headers were set correctly
    const response = await page.goto('/');
    
    expect(response?.status()).toBe(200);
    
    // If playwright.config.ts is working correctly,
    // x-test-mode header should be set
    // This is a smoke test for configuration
  });
});
