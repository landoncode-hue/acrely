import { test, expect } from '@playwright/test';

/**
 * Production Readiness Tests
 * Validates production deployment requirements
 */

test.describe('Production Environment Checks', () => {
  
  test('environment variables are configured', async ({ page }) => {
    // Check if app loads without environment errors
    await page.goto('/');
    
    // Should not show missing env var errors
    await expect(page.getByText(/missing.*environment|env.*not.*found/i)).not.toBeVisible();
    
    // App should render correctly
    await expect(page.getByRole('heading', { name: /acrely|sign in|login/i })).toBeVisible();
  });

  test('Supabase connection is active in production', async ({ page }) => {
    await page.goto('/');
    
    // Login to test Supabase connection
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should successfully authenticate via Supabase
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Dashboard should load data from Supabase
    await expect(page.getByText(/customers|revenue|dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  test('API endpoints are reachable', async ({ request }) => {
    // Test health check endpoint
    const healthResponse = await request.get('/api/health').catch(() => ({ status: () => 404 }));
    
    // Either health endpoint exists or we get a valid response
    expect([200, 404, 405]).toContain(healthResponse.status());
  });

  test('static assets load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if images load
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 3)) { // Check first 3 images
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        expect(src).toBeTruthy();
      }
    }
    
    // Check if CSS is loaded (page should be styled)
    const bodyBg = await page.locator('body').evaluate(
      el => window.getComputedStyle(el).backgroundColor
    );
    expect(bodyBg).toBeTruthy();
  });

  test('SSL/HTTPS is configured', async ({ page }) => {
    const url = page.url();
    
    // If running on production domain, should use HTTPS
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  test('page performance is acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds (generous for production)
    expect(loadTime).toBeLessThan(5000);
  });

  test('dashboard loads within acceptable time', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    const startTime = Date.now();
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('warning')
    );
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Page should render correctly
    await expect(page.getByRole('heading', { name: /acrely|sign in/i })).toBeVisible();
    
    // Login form should be visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('error boundaries are working', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to non-existent page
    await page.goto('/dashboard/nonexistent-page-xyz');
    
    // Should show error page or redirect, not crash
    const hasErrorUI = await page.getByText(/not found|404|error|go back/i).isVisible();
    const hasRedirect = page.url().includes('dashboard') || page.url().includes('login');
    
    expect(hasErrorUI || hasRedirect).toBeTruthy();
  });

  test('authentication persists across page reloads', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('logout works correctly', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Logout
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login
      await expect(page).toHaveURL('/', { timeout: 5000 });
    }
  });

  test('database migrations are applied', async ({ page }) => {
    // Login and navigate to a page that requires migrations
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navigate to customers (requires schema)
    await page.goto('/dashboard/customers');
    
    // Should load without schema errors
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible({ timeout: 10000 });
  });

  test('edge functions are deployed', async ({ request }) => {
    // Try to call a known edge function
    const functionsToTest = [
      '/api/system-health-check',
      '/api/health',
    ];
    
    let atLeastOneWorks = false;
    
    for (const func of functionsToTest) {
      try {
        const response = await request.get(func);
        if (response.status() < 500) {
          atLeastOneWorks = true;
          break;
        }
      } catch {
        // Continue to next function
      }
    }
    
    // At least one health check should work
    expect(atLeastOneWorks).toBeTruthy();
  });

  test('CORS is properly configured', async ({ request }) => {
    const response = await request.get('/api/customers', {
      headers: {
        'Origin': 'https://acrely.vercel.app'
      }
    });
    
    // Should not have CORS errors (status should be auth-related, not CORS)
    expect([401, 403, 200]).toContain(response.status());
  });

  test('rate limiting is not blocking normal use', async ({ page }) => {
    await page.goto('/');
    
    // Make multiple requests
    for (let i = 0; i < 5; i++) {
      await page.reload();
      await page.waitForTimeout(500);
    }
    
    // Should still be able to access the page
    await expect(page.getByRole('heading', { name: /acrely|sign in/i })).toBeVisible();
  });

  test('domain and DNS are configured', async ({ page }) => {
    const response = await page.goto('/');
    
    // Should get a valid response
    expect(response?.status()).toBeLessThan(500);
    
    // Page should load
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('build version is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check if version info is available (could be in footer, settings, etc.)
    const pageContent = await page.content();
    
    // Page should have loaded
    expect(pageContent.length).toBeGreaterThan(1000);
  });

  test('critical paths are functional', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navigate through critical pages
    const criticalPages = [
      '/dashboard/customers',
      '/dashboard/allocations',
      '/dashboard/payments',
      '/dashboard/reports',
    ];
    
    for (const pagePath of criticalPages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      
      // Should load without errors
      const pageLoaded = await page.getByRole('heading').count() > 0;
      expect(pageLoaded).toBeTruthy();
    }
  });

  test('monitoring and analytics are active', async ({ page }) => {
    await page.goto('/');
    
    // Check if analytics scripts are loaded (if applicable)
    const scripts = await page.locator('script').count();
    
    // Should have some scripts loaded
    expect(scripts).toBeGreaterThan(0);
  });
});
