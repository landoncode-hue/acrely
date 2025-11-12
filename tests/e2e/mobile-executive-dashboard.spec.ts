import { test, expect } from '@playwright/test';

test.describe('Mobile Executive Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as CEO
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'ceo@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'test_password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to executive dashboard
    await page.waitForURL('**/executive');
  });

  test('should display executive dashboard for CEO', async ({ page }) => {
    // Check if executive dashboard is visible
    await expect(page.getByText(/Welcome/i)).toBeVisible();
    await expect(page.getByText(/CEO/i)).toBeVisible();

    // Check for key metrics
    await expect(page.getByText(/Total Customers/i)).toBeVisible();
    await expect(page.getByText(/Total Plots/i)).toBeVisible();
    await expect(page.getByText(/Total Revenue/i)).toBeVisible();
    await expect(page.getByText(/Total Commissions/i)).toBeVisible();
  });

  test('should display business overview metrics', async ({ page }) => {
    await expect(page.getByText(/Business Overview/i)).toBeVisible();
  });

  test('should display system health status', async ({ page }) => {
    await expect(page.getByText(/System Health/i)).toBeVisible();
  });

  test('should display live activity feed', async ({ page }) => {
    await expect(page.getByText(/Live Activity/i)).toBeVisible();
  });
});

test.describe('Role-Based Access Control', () => {
  test('should redirect CEO to executive dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'ceo@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'test_password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/executive');
    await expect(page.getByText(/Executive/i)).toBeVisible();
  });

  test('should redirect Agent to regular dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'agent@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'test_password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
  });
});
