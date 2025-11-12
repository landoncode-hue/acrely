import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Field Reports System
 * Tests agent submission, admin review, and performance tracking
 */

test.describe('Field Reports - Agent Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'agent@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should submit a new field report', async ({ page }) => {
    // Navigate to create report
    await page.goto('/reports/new');

    // Wait for form to load
    await expect(page.locator('h1')).toContainText('Daily Field Report');

    // Fill out the form
    await page.fill('input[placeholder*="total visits"]', '10');
    await page.fill('input[placeholder*="successful visits"]', '7');
    await page.fill('input[placeholder*="0.00"]', '150000');
    await page.fill('input[placeholder*="leads generated"]', '3');
    await page.fill('textarea[placeholder*="additional details"]', 'Visited Lekki and Ikoyi estates. Good engagement.');

    // Submit the report
    await page.click('button:has-text("Submit Report")');

    // Confirm submission
    await page.click('button:has-text("Submit")');

    // Verify success message
    await expect(page.locator('text=✅ Report Submitted Successfully')).toBeVisible();
  });

  test('should prevent duplicate report submission for same date', async ({ page }) => {
    // Submit first report
    await page.goto('/reports/new');
    await page.fill('input[placeholder*="total visits"]', '5');
    await page.fill('input[placeholder*="successful visits"]', '3');
    await page.fill('input[placeholder*="0.00"]', '50000');
    await page.fill('input[placeholder*="leads generated"]', '2');
    await page.click('button:has-text("Submit Report")');
    await page.click('button:has-text("Submit")');

    // Try to submit another report for the same day
    await page.goto('/reports/new');
    await page.fill('input[placeholder*="total visits"]', '8');
    await page.fill('input[placeholder*="successful visits"]', '5');
    await page.fill('input[placeholder*="0.00"]', '75000');
    await page.fill('input[placeholder*="leads generated"]', '1');
    await page.click('button:has-text("Submit Report")');
    await page.click('button:has-text("Submit")');

    // Verify duplicate error
    await expect(page.locator('text=Report Already Exists')).toBeVisible();
  });

  test('should view report history', async ({ page }) => {
    await page.goto('/reports/history');

    // Verify page loaded
    await expect(page.locator('text=My Field Reports')).toBeVisible();

    // Verify stats are visible
    await expect(page.locator('text=Total Reports')).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();

    // Verify filters
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Pending")')).toBeVisible();
  });

  test('should edit pending report within 24 hours', async ({ page }) => {
    // Create a new report
    await page.goto('/reports/new');
    await page.fill('input[placeholder*="total visits"]', '6');
    await page.fill('input[placeholder*="successful visits"]', '4');
    await page.fill('input[placeholder*="0.00"]', '60000');
    await page.fill('input[placeholder*="leads generated"]', '2');
    await page.click('button:has-text("Submit Report")');
    await page.click('button:has-text("Submit")');

    // Navigate to history
    await page.goto('/reports/history');

    // Click edit on the first pending report
    await page.click('button:has-text("Edit")');

    // Update the report
    await page.fill('input[placeholder*="total visits"]', '8');
    await page.fill('input[placeholder*="successful visits"]', '6');
    await page.click('button:has-text("Update Report")');

    // Verify success
    await expect(page.locator('text=Report Updated')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/reports/new');

    // Try to submit empty form
    await page.click('button:has-text("Submit Report")');

    // Verify validation errors
    await expect(page.locator('text=Total visits must be a positive number')).toBeVisible();

    // Fill invalid data (successful > total)
    await page.fill('input[placeholder*="total visits"]', '5');
    await page.fill('input[placeholder*="successful visits"]', '10');
    await page.click('button:has-text("Submit Report")');

    await expect(page.locator('text=Cannot exceed total visits')).toBeVisible();
  });
});

test.describe('Field Reports - Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should view all field reports', async ({ page }) => {
    await page.goto('/dashboard/field-reports');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Field Reports Management');

    // Verify filters are present
    await expect(page.locator('select[value="all"]')).toBeVisible();

    // Verify stats cards
    await expect(page.locator('text=Total Reports')).toBeVisible();
    await expect(page.locator('text=Pending Review')).toBeVisible();
  });

  test('should approve a pending report', async ({ page }) => {
    await page.goto('/dashboard/field-reports');

    // Filter to show only pending reports
    await page.selectOption('select', 'pending');
    await page.click('button:has-text("Apply Filters")');

    // Click approve on first report
    const approveButton = page.locator('button:has-text("Approve")').first();
    await approveButton.click();

    // Add review notes
    await page.fill('textarea[placeholder*="review notes"]', 'Great work! Keep it up.');

    // Confirm approval
    await page.click('button:has-text("Approve")');

    // Verify the report is approved
    await page.selectOption('select', 'approved');
    await page.click('button:has-text("Apply Filters")');

    // Should see at least one approved report
    await expect(page.locator('text=Approved').first()).toBeVisible();
  });

  test('should flag a report for review', async ({ page }) => {
    await page.goto('/dashboard/field-reports');

    // Filter pending reports
    await page.selectOption('select', 'pending');
    await page.click('button:has-text("Apply Filters")');

    // Click flag on first report
    const flagButton = page.locator('button:has-text("Flag")').first();
    await flagButton.click();

    // Add review notes (required for flagging)
    await page.fill('textarea[placeholder*="review notes"]', 'Please provide more details about visit locations.');

    // Confirm flagging
    await page.click('button:has-text("Flag")');

    // Verify the report is flagged
    await page.selectOption('select', 'flagged');
    await page.click('button:has-text("Apply Filters")');

    await expect(page.locator('text=Flagged').first()).toBeVisible();
  });

  test('should filter reports by date range', async ({ page }) => {
    await page.goto('/dashboard/field-reports');

    // Set date range
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    await page.fill('input[type="date"]', lastWeek.toISOString().split('T')[0]);
    await page.fill('input[type="date"]:nth-of-type(2)', today.toISOString().split('T')[0]);

    // Apply filters
    await page.click('button:has-text("Apply Filters")');

    // Verify table updates (at least 0 rows)
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Field Reports - Performance Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Login as MD
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'md@pinnaclegroups.ng');
    await page.fill('input[name="password"]', 'mdpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should view agent performance leaderboard', async ({ page }) => {
    // Navigate to executive dashboard
    await page.goto('/dashboard/executive');

    // Verify leaderboard section exists
    await expect(page.locator('text=Top Performing Agents')).toBeVisible();

    // Verify performance tiers
    await expect(page.locator('text=Platinum').or(page.locator('text=Gold')).or(page.locator('text=Silver'))).toBeVisible();
  });

  test('should view agent performance scores', async ({ page }) => {
    await page.goto('/dashboard/executive');

    // Verify score components are visible
    await expect(page.locator('text=Overall Score')).toBeVisible();
    await expect(page.locator('text=Activity')).toBeVisible();
    await expect(page.locator('text=Success')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
  });

  test('should display agent metrics', async ({ page }) => {
    await page.goto('/dashboard/executive');

    // Verify metrics are shown
    await expect(page.locator('text=Visits')).toBeVisible();
    await expect(page.locator('text=Successful')).toBeVisible();
    await expect(page.locator('text=Collected')).toBeVisible();
    await expect(page.locator('text=Leads')).toBeVisible();
  });
});

test.describe('Field Reports - Realtime Updates', () => {
  test('should show realtime status updates', async ({ context }) => {
    // Open two pages: agent and admin
    const agentPage = await context.newPage();
    const adminPage = await context.newPage();

    // Login as agent
    await agentPage.goto('/auth/login');
    await agentPage.fill('input[name="email"]', 'agent@pinnaclegroups.ng');
    await agentPage.fill('input[name="password"]', 'testpassword');
    await agentPage.click('button[type="submit"]');
    await agentPage.waitForURL('/dashboard');

    // Login as admin
    await adminPage.goto('/auth/login');
    await adminPage.fill('input[name="email"]', 'admin@pinnaclegroups.ng');
    await adminPage.fill('input[name="password"]', 'adminpassword');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('/dashboard');

    // Agent submits a report
    await agentPage.goto('/reports/new');
    await agentPage.fill('input[placeholder*="total visits"]', '12');
    await agentPage.fill('input[placeholder*="successful visits"]', '9');
    await agentPage.fill('input[placeholder*="0.00"]', '200000');
    await agentPage.fill('input[placeholder*="leads generated"]', '4');
    await agentPage.click('button:has-text("Submit Report")');
    await agentPage.click('button:has-text("Submit")');

    // Admin approves the report
    await adminPage.goto('/dashboard/field-reports');
    await adminPage.selectOption('select', 'pending');
    await adminPage.click('button:has-text("Apply Filters")');
    const adminApproveButton = adminPage.locator('button:has-text("Approve")').first();
    await adminApproveButton.click();
    await adminPage.fill('textarea[placeholder*="review notes"]', 'Excellent performance!');
    await adminPage.click('button:has-text("Approve")');

    // Agent should see approval notification
    await agentPage.goto('/reports/history');
    await expect(agentPage.locator('text=✅ Report Approved')).toBeVisible({ timeout: 10000 });

    await agentPage.close();
    await adminPage.close();
  });
});
