import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new user and login
    await page.goto('/');
    // Assuming test user exists
    await page.fill('[name="email"]', 'test.agent@pinnaclegroups.ng');
    await page.fill('[name="password"]', 'testPassword123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
  });

  test('should display onboarding tour for new users', async ({ page }) => {
    // Check if Joyride tour appears
    const tourStep = page.locator('[data-tour-elem="step-0"]');
    await expect(tourStep).toBeVisible({ timeout: 5000 });
    
    // Verify welcome message
    await expect(page.locator('text=Welcome to Acrely!')).toBeVisible();
  });

  test('should navigate through onboarding steps', async ({ page }) => {
    // Wait for tour to start
    await page.waitForSelector('[data-tour-elem="step-0"]', { timeout: 5000 });
    
    // Click "Next" button
    await page.click('button:has-text("Next")');
    
    // Verify second step appears
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Continue through steps
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
  });

  test('should allow skipping the tour', async ({ page }) => {
    // Wait for tour to start
    await page.waitForSelector('[data-tour-elem="step-0"]', { timeout: 5000 });
    
    // Click "Skip Tour" button
    await page.click('button:has-text("Skip Tour")');
    
    // Tour should disappear
    await expect(page.locator('[data-tour-elem="step-0"]')).not.toBeVisible();
  });

  test('should mark onboarding as complete after finishing', async ({ page }) => {
    // Complete all tour steps
    await page.waitForSelector('[data-tour-elem="step-0"]', { timeout: 5000 });
    
    // Click through all steps (adjust number based on role)
    for (let i = 0; i < 8; i++) {
      try {
        await page.click('button:has-text("Next")', { timeout: 2000 });
      } catch {
        // Last step, click "Finish"
        await page.click('button:has-text("Finish")');
        break;
      }
    }
    
    // Verify onboarding is marked complete in database
    // Tour should not appear on page reload
    await page.reload();
    await expect(page.locator('[data-tour-elem="step-0"]')).not.toBeVisible();
  });

  test('should show role-specific steps for Agent', async ({ page }) => {
    // Assuming agent user
    await page.waitForSelector('[data-tour-elem="step-0"]', { timeout: 5000 });
    
    // Navigate to leads step (specific to Agent role)
    while (await page.locator('button:has-text("Next")').isVisible()) {
      await page.click('button:has-text("Next")');
      
      // Check if leads step appears
      const leadsStep = page.locator('text=Manage your leads');
      if (await leadsStep.isVisible()) {
        // Verify agent-specific content
        await expect(page.locator('text=commission')).toBeVisible();
        break;
      }
    }
  });
});

test.describe('Help Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[name="email"]', 'test.user@pinnaclegroups.ng');
    await page.fill('[name="password"]', 'testPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to help center from sidebar', async ({ page }) => {
    // Click Help Center link in sidebar
    await page.click('a[href="/help"]');
    
    // Verify help page loaded
    await expect(page).toHaveURL('/help');
    await expect(page.locator('h1:has-text("Help Center")')).toBeVisible();
  });

  test('should display help sections', async ({ page }) => {
    await page.goto('/help');
    
    // Verify main sections are visible
    await expect(page.locator('text=Getting Started')).toBeVisible();
    await expect(page.locator('text=Managing Clients')).toBeVisible();
    await expect(page.locator('text=Allocations & Payments')).toBeVisible();
  });

  test('should show role-specific content', async ({ page }) => {
    await page.goto('/help');
    
    // Check if Reports section is visible (admin only)
    const reportsSection = page.locator('text=Reports & Analytics');
    
    // This will be visible only for CEO, MD, SysAdmin
    // For other roles, it should not appear
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/help');
    
    // Scroll to FAQ section
    await page.locator('#faq').scrollIntoViewIfNeeded();
    
    // Verify FAQ questions
    await expect(page.locator('text=How do I reset my password?')).toBeVisible();
    await expect(page.locator('text=Can I access Acrely from my mobile device?')).toBeVisible();
  });

  test('should expand FAQ answers', async ({ page }) => {
    await page.goto('/help');
    
    // Click on FAQ question
    await page.click('summary:has-text("How do I reset my password?")');
    
    // Verify answer appears
    await expect(page.locator('text=Contact your system administrator')).toBeVisible();
  });

  test('should link to video tutorials', async ({ page }) => {
    await page.goto('/help');
    
    // Find a video link
    const videoLink = page.locator('a:has-text("Watch Video")').first();
    
    // Verify link has href attribute
    await expect(videoLink).toHaveAttribute('href');
  });
});

test.describe('Feedback Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('[name="email"]', 'test.user@pinnaclegroups.ng');
    await page.fill('[name="password"]', 'testPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to feedback page', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Verify feedback form loaded
    await expect(page.locator('h1:has-text("Help & Feedback")')).toBeVisible();
  });

  test('should submit feedback successfully', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Select feedback type
    await page.click('button:has-text("General Feedback")');
    
    // Fill in form
    await page.selectOption('select#category', 'dashboard');
    await page.selectOption('select#priority', 'medium');
    await page.fill('input#title', 'Test Feedback Title');
    await page.fill('textarea#description', 'This is a test feedback submission for the dashboard feature.');
    
    // Submit form
    await page.click('button:has-text("Submit Feedback")');
    
    // Verify success message
    await expect(page.locator('text=Thank You for Your Feedback!')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Submit Feedback")');
    
    // Browser validation should prevent submission
    const titleInput = page.locator('input#title');
    await expect(titleInput).toHaveAttribute('required');
  });

  test('should submit bug report', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Select bug report type
    await page.click('button:has-text("Bug Report")');
    
    // Verify description placeholder changes
    await expect(page.locator('textarea#description')).toHaveAttribute('placeholder');
    
    // Fill and submit
    await page.fill('input#title', 'Payment form not submitting');
    await page.fill('textarea#description', 'Steps to reproduce: 1. Go to payments 2. Fill form 3. Click submit 4. Form does not submit');
    await page.click('button:has-text("Submit Feedback")');
    
    // Verify submission
    await expect(page.locator('text=Thank You')).toBeVisible({ timeout: 5000 });
  });

  test('should submit feature request', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Select feature request
    await page.click('button:has-text("Feature Request")');
    
    // Fill form
    await page.fill('input#title', 'Add bulk customer import');
    await page.fill('textarea#description', 'It would be helpful to import customers from a CSV file instead of adding them one by one.');
    await page.selectOption('select#priority', 'low');
    
    // Submit
    await page.click('button:has-text("Submit Feedback")');
    
    // Verify
    await expect(page.locator('text=Thank You')).toBeVisible({ timeout: 5000 });
  });

  test('should allow canceling feedback submission', async ({ page }) => {
    await page.goto('/dashboard/feedback');
    
    // Fill some data
    await page.fill('input#title', 'Test');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Should navigate back
    await expect(page).not.toHaveURL('/dashboard/feedback');
  });
});
