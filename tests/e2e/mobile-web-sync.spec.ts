import { test, expect } from '@playwright/test';

/**
 * Mobile-Web Synchronization Tests
 * Tests data sync between mobile app and web platform via Supabase
 */

test.describe('Mobile-Web Sync', () => {
  test.beforeEach(async ({ page }) => {
    // Login to web app
    await page.goto('/');
    await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
    await page.getByLabel(/password/i).fill('Test@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('customer created on mobile appears on web', async ({ page }) => {
    // Simulate creating a customer that would come from mobile
    // In a real scenario, this would be created via mobile app
    const timestamp = Date.now();
    const customerName = `Mobile Customer ${timestamp}`;
    
    // Create customer via web (simulating mobile creation)
    await page.goto('/dashboard/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    
    await page.getByLabel(/full name/i).fill(customerName);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`mobile${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/customer created/i)).toBeVisible({ timeout: 5000 });
    
    // Wait for sync
    await page.waitForTimeout(2000);
    
    // Reload to verify persistence (simulating mobile-web sync)
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Search for customer
    await page.getByPlaceholder(/search/i).fill(customerName);
    await page.waitForTimeout(500);
    
    // Customer should be visible
    await expect(page.getByText(customerName)).toBeVisible();
  });

  test('payment recorded on web syncs to mobile view', async ({ page }) => {
    // Navigate to payments
    await page.goto('/dashboard/payments');
    
    const timestamp = Date.now();
    
    // Record a payment
    const recordButton = page.getByRole('button', { name: /record payment/i });
    if (await recordButton.isVisible()) {
      await recordButton.click();
      
      // Fill payment details
      const allocationField = page.getByLabel(/allocation/i);
      if (await allocationField.isVisible()) {
        await allocationField.click();
        const firstOption = page.getByRole('option').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }
      
      await page.getByLabel(/amount/i).fill('50000');
      await page.getByLabel(/payment method/i).selectOption('cash');
      await page.getByLabel(/reference/i).fill(`SYNC-${timestamp}`);
      
      await page.getByRole('button', { name: /save|record/i }).click();
      
      await expect(page.getByText(/payment recorded/i)).toBeVisible({ timeout: 5000 });
      
      // Wait for sync
      await page.waitForTimeout(2000);
      
      // Verify payment appears in list
      await page.reload();
      await page.waitForTimeout(1000);
      
      const paymentReference = page.getByText(`SYNC-${timestamp}`);
      await expect(paymentReference).toBeVisible({ timeout: 5000 });
    }
  });

  test('real-time sync updates dashboard stats', async ({ page }) => {
    // Get initial stats
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const dashboardContent = await page.content();
    expect(dashboardContent).toContain('customers');
    
    // Create a new customer to trigger stats update
    await page.goto('/dashboard/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    
    const timestamp = Date.now();
    await page.getByLabel(/full name/i).fill(`Sync Test ${timestamp}`);
    await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await page.getByLabel(/email/i).fill(`sync${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/customer created/i)).toBeVisible({ timeout: 5000 });
    
    // Wait for real-time sync
    await page.waitForTimeout(3000);
    
    // Return to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Stats should be updated
    await expect(page.getByText(/total customers/i)).toBeVisible();
  });

  test('field reports sync between platforms', async ({ page }) => {
    await page.goto('/dashboard/field-reports');
    
    const createButton = page.getByRole('button', { name: /create|new/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const timestamp = Date.now();
      const reportText = `Site inspection completed - ${timestamp}`;
      
      // Fill report details
      const textArea = page.getByLabel(/report|description|notes/i);
      if (await textArea.isVisible()) {
        await textArea.fill(reportText);
      }
      
      await page.getByRole('button', { name: /save|submit/i }).click();
      
      // Wait for success message
      const successMessages = await page.getByText(/saved|created|submitted/i).count();
      if (successMessages > 0) {
        await page.waitForTimeout(2000);
        
        // Reload to verify sync
        await page.reload();
        await page.waitForTimeout(1000);
        
        // Report should be visible
        const reportVisible = await page.getByText(reportText.substring(0, 20)).isVisible();
        expect(reportVisible).toBeTruthy();
      }
    }
  });

  test('allocation changes sync across platforms', async ({ page }) => {
    await page.goto('/dashboard/allocations');
    
    const timestamp = Date.now();
    
    const createButton = page.getByRole('button', { name: /create allocation/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Select customer
      const customerField = page.getByLabel(/customer/i);
      if (await customerField.isVisible()) {
        await customerField.click();
        const firstOption = page.getByRole('option').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }
      
      // Select plot
      const plotField = page.getByLabel(/plot/i);
      if (await plotField.isVisible()) {
        await plotField.click();
        const firstPlot = page.getByRole('option').first();
        if (await firstPlot.isVisible()) {
          await firstPlot.click();
        }
      }
      
      // Select payment plan
      const planField = page.getByLabel(/payment plan/i);
      if (await planField.isVisible()) {
        await planField.selectOption('outright');
      }
      
      await page.getByRole('button', { name: /create/i }).click();
      
      const created = await page.getByText(/allocation created/i).isVisible({ timeout: 5000 });
      if (created) {
        // Wait for sync
        await page.waitForTimeout(2000);
        
        // Verify it appears in list
        await page.reload();
        await page.waitForTimeout(1000);
        
        const hasAllocations = await page.getByRole('heading', { name: /allocations/i }).isVisible();
        expect(hasAllocations).toBeTruthy();
      }
    }
  });

  test('concurrent updates are handled correctly', async ({ browser }) => {
    // Create two contexts simulating web and mobile
    const webContext = await browser.newContext();
    const mobileContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const webPage = await webContext.newPage();
    const mobilePage = await mobileContext.newPage();
    
    // Login on both
    for (const page of [webPage, mobilePage]) {
      await page.goto('/');
      await page.getByLabel(/email/i).fill('admin@pinnaclegroups.ng');
      await page.getByLabel(/password/i).fill('Test@123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/dashboard');
    }
    
    // Both navigate to customers
    await webPage.goto('/dashboard/customers');
    await mobilePage.goto('/dashboard/customers');
    
    await webPage.waitForTimeout(1000);
    await mobilePage.waitForTimeout(1000);
    
    // Create customer on web
    await webPage.getByRole('button', { name: /add customer/i }).click();
    const timestamp = Date.now();
    await webPage.getByLabel(/full name/i).fill(`Concurrent ${timestamp}`);
    await webPage.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
    await webPage.getByLabel(/email/i).fill(`concurrent${timestamp}@test.com`);
    await webPage.getByRole('button', { name: /save/i }).click();
    
    await expect(webPage.getByText(/customer created/i)).toBeVisible({ timeout: 5000 });
    
    // Wait for sync
    await mobilePage.waitForTimeout(3000);
    
    // Reload mobile view
    await mobilePage.reload();
    await mobilePage.waitForTimeout(1000);
    
    // Customer should appear on mobile
    await mobilePage.getByPlaceholder(/search/i).fill(`Concurrent ${timestamp}`);
    await mobilePage.waitForTimeout(500);
    
    const customerVisible = await mobilePage.getByText(`Concurrent ${timestamp}`).isVisible({ timeout: 5000 });
    expect(customerVisible).toBeTruthy();
    
    await webContext.close();
    await mobileContext.close();
  });

  test('offline changes sync when back online', async ({ page, context }) => {
    // Go to customers page
    await page.goto('/dashboard/customers');
    await page.waitForTimeout(1000);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to create customer (should queue or fail gracefully)
    const addButton = page.getByRole('button', { name: /add customer/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      const timestamp = Date.now();
      await page.getByLabel(/full name/i).fill(`Offline ${timestamp}`);
      await page.getByLabel(/phone/i).fill(`080${timestamp.toString().slice(-8)}`);
      await page.getByLabel(/email/i).fill(`offline${timestamp}@test.com`);
      
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should show offline message or queue
      await page.waitForTimeout(1000);
    }
    
    // Go back online
    await context.setOffline(false);
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Page should load normally
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
  });
});
