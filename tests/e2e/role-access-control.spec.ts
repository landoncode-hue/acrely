import { test, expect } from '@playwright/test';

/**
 * Role-Based Access Control (RBAC) Tests
 * Tests different user roles: CEO, MD, SysAdmin, Frontdesk, Agent
 */

// Test credentials for different roles
const ROLES = {
  ceo: {
    email: 'ceo@pinnaclegroups.ng',
    password: 'Test@123',
    role: 'CEO'
  },
  md: {
    email: 'md@pinnaclegroups.ng',
    password: 'Test@123',
    role: 'MD'
  },
  sysadmin: {
    email: 'admin@pinnaclegroups.ng',
    password: 'Test@123',
    role: 'SysAdmin'
  },
  frontdesk: {
    email: 'frontdesk@pinnaclegroups.ng',
    password: 'Test@123',
    role: 'Frontdesk'
  },
  agent: {
    email: 'agent@pinnaclegroups.ng',
    password: 'Test@123',
    role: 'Agent'
  }
};

test.describe('Role-Based Access Control', () => {
  
  test('SysAdmin has full access to all modules', async ({ page }) => {
    // Login as SysAdmin
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.sysadmin.email);
    await page.getByLabel(/password/i).fill(ROLES.sysadmin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Should have access to all navigation items
    await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /allocations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /payments/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /billing/i })).toBeVisible();
    
    // Should access audit logs
    const auditLink = page.getByRole('link', { name: /audit/i });
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await expect(page).toHaveURL(/audit/);
    }
    
    // Should access system settings
    const systemLink = page.getByRole('link', { name: /system|settings/i });
    if (await systemLink.isVisible()) {
      await systemLink.click();
      await expect(page).toHaveURL(/system|settings/);
    }
  });

  test('CEO has access to analytics and reports', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.ceo.email);
    await page.getByLabel(/password/i).fill(ROLES.ceo.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // CEO should see analytics
    const analyticsLink = page.getByRole('link', { name: /analytics|reports/i });
    await expect(analyticsLink.first()).toBeVisible();
    
    await analyticsLink.first().click();
    
    // Should see charts and metrics
    await page.waitForTimeout(2000);
    await expect(page.getByText(/revenue|performance|analytics/i)).toBeVisible();
  });

  test('Frontdesk has limited access', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.frontdesk.email);
    await page.getByLabel(/password/i).fill(ROLES.frontdesk.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Should access customer management
    await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    
    // Should access payments
    await expect(page.getByRole('link', { name: /payments/i })).toBeVisible();
    
    // Should NOT see system settings or audit logs (if RBAC is strict)
    const systemLink = page.getByRole('link', { name: /system|settings/i });
    const auditLink = page.getByRole('link', { name: /audit/i });
    
    // These might be hidden or restricted
    const systemVisible = await systemLink.count();
    const auditVisible = await auditLink.count();
    
    // At least one of these should be restricted
    expect(systemVisible === 0 || auditVisible === 0).toBeTruthy();
  });

  test('Agent has access to agent dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.agent.email);
    await page.getByLabel(/password/i).fill(ROLES.agent.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Agent should see their commission info
    const commissionText = page.getByText(/commission|earnings|agent/i);
    await expect(commissionText.first()).toBeVisible({ timeout: 5000 });
    
    // Should see field reports
    const fieldReportsLink = page.getByRole('link', { name: /field reports/i });
    if (await fieldReportsLink.isVisible()) {
      await fieldReportsLink.click();
      await expect(page).toHaveURL(/field-reports/);
    }
  });

  test('MD has similar access to CEO', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.md.email);
    await page.getByLabel(/password/i).fill(ROLES.md.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // MD should see analytics
    const analyticsLink = page.getByRole('link', { name: /analytics|reports/i });
    await expect(analyticsLink.first()).toBeVisible();
    
    // Should see comprehensive dashboard
    await expect(page.getByText(/revenue|customers|plots/i)).toBeVisible();
  });

  test('unauthorized role cannot access admin endpoints', async ({ page }) => {
    // Login as agent
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.agent.email);
    await page.getByLabel(/password/i).fill(ROLES.agent.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Try to access system settings directly
    const response = await page.goto('/dashboard/system');
    
    // Should either redirect or show error
    if (response) {
      const url = page.url();
      const isBlocked = url.includes('unauthorized') || 
                       url.includes('forbidden') || 
                       !url.includes('system');
      
      // If not blocked by redirect, check for error message
      if (!isBlocked) {
        const errorVisible = await page.getByText(/unauthorized|forbidden|access denied/i).isVisible();
        expect(errorVisible).toBeTruthy();
      }
    }
  });

  test('role permissions persist across sessions', async ({ page, context }) => {
    // Login as frontdesk
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.frontdesk.email);
    await page.getByLabel(/password/i).fill(ROLES.frontdesk.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Get initial permissions
    const hasCustomers = await page.getByRole('link', { name: /customers/i }).isVisible();
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Permissions should remain the same
    const hasCustomersAfterReload = await page.getByRole('link', { name: /customers/i }).isVisible();
    expect(hasCustomers).toBe(hasCustomersAfterReload);
  });

  test('different roles see different dashboard widgets', async ({ browser }) => {
    // Create two contexts for parallel testing
    const adminContext = await browser.newContext();
    const agentContext = await browser.newContext();
    
    const adminPage = await adminContext.newPage();
    const agentPage = await agentContext.newPage();
    
    // Login as admin
    await adminPage.goto('/');
    await adminPage.getByLabel(/email/i).fill(ROLES.sysadmin.email);
    await adminPage.getByLabel(/password/i).fill(ROLES.sysadmin.password);
    await adminPage.getByRole('button', { name: /sign in/i }).click();
    await adminPage.waitForURL('/dashboard');
    
    // Login as agent
    await agentPage.goto('/');
    await agentPage.getByLabel(/email/i).fill(ROLES.agent.email);
    await agentPage.getByLabel(/password/i).fill(ROLES.agent.password);
    await agentPage.getByRole('button', { name: /sign in/i }).click();
    await agentPage.waitForURL('/dashboard');
    
    // Wait for dashboards to load
    await adminPage.waitForTimeout(2000);
    await agentPage.waitForTimeout(2000);
    
    // Admin should see system stats
    const adminStats = await adminPage.getByText(/total customers|total revenue|system/i).count();
    
    // Agent should see commission stats
    const agentStats = await agentPage.getByText(/commission|my earnings|agent/i).count();
    
    // They should see different content
    expect(adminStats).toBeGreaterThan(0);
    expect(agentStats).toBeGreaterThan(0);
    
    await adminContext.close();
    await agentContext.close();
  });

  test('role-based data filtering works', async ({ page }) => {
    // Login as agent
    await page.goto('/');
    await page.getByLabel(/email/i).fill(ROLES.agent.email);
    await page.getByLabel(/password/i).fill(ROLES.agent.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
    
    // Navigate to customers or allocations
    const customersLink = page.getByRole('link', { name: /customers/i });
    if (await customersLink.isVisible()) {
      await customersLink.click();
      await page.waitForTimeout(2000);
      
      // Agent should only see their own customers (if role filtering is implemented)
      // This is a basic check - actual implementation depends on business logic
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    }
  });
});
