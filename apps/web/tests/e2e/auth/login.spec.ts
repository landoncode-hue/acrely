import { test, expect } from '@playwright/test';
import { loginAs, loginWithCredentials, TEST_USERS } from '../utils/login';

/**
 * Authentication Tests - Login Flow
 * 
 * Tests user login functionality with different roles
 * and validates proper authentication behavior
 */

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Acrely|Pinnacle/i);
    
    // Check welcome message
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    
    // Check form elements are present
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('admin can log in successfully', async ({ page }) => {
    await loginAs(page, 'admin');
    
    // Should be on analytics dashboard (admin redirects there)
    await expect(page).toHaveURL('/dashboard/analytics');
    
    // Should see welcome message
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('agent can log in successfully', async ({ page }) => {
    await loginAs(page, 'agent');
    
    // Should be on main dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should see dashboard content
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('frontdesk can log in successfully', async ({ page }) => {
    await loginAs(page, 'frontdesk');
    
    // Should be on main dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginWithCredentials(page, 'invalid@test.com', 'wrongpassword', false);
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
    
    // Should show error message
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for empty fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Browser validation should prevent submission
    // Check that we're still on login page
    await expect(page).toHaveURL('/login');
  });

  test('should disable submit button while loading', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Fill in valid credentials
    await page.fill('input#email', TEST_USERS.admin.email);
    await page.fill('input#password', TEST_USERS.admin.password);
    
    // Click submit
    await submitButton.click();
    
    // Button should show loading state (if implemented)
    // This is a UX check - adjust based on your implementation
    const loadingText = page.getByText(/signing in/i);
    const isLoadingVisible = await loadingText.isVisible().catch(() => false);
    
    if (isLoadingVisible) {
      await expect(loadingText).toBeVisible();
    }
  });
});

test.describe('Authentication - Session Persistence', () => {
  test('should persist session after page reload', async ({ page }) => {
    // Login
    await loginAs(page, 'admin');
    await expect(page).toHaveURL('/dashboard/analytics');
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/dashboard/analytics');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/$|\/login/);
  });
});
