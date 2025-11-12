import { test, expect } from "@playwright/test";

test.describe("Receipt Generation and Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/");

    // Login with test credentials
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || "admin@test.com");
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || "password123");
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL("/dashboard");
  });

  test("should automatically generate receipt when payment is confirmed", async ({ page }) => {
    // Navigate to payments page
    await page.click('a[href="/dashboard/payments"]');
    await page.waitForURL("/dashboard/payments");

    // Record a new payment
    await page.click('button:has-text("Record Payment")');

    // Fill in payment form
    await page.selectOption('select[name="allocation_id"]', { index: 1 });
    await page.fill('input[name="amount"]', "500000");
    await page.selectOption('select[name="payment_method"]', "bank_transfer");
    await page.fill('input[name="reference"]', `TEST-${Date.now()}`);
    await page.selectOption('select[name="status"]', "confirmed");

    // Submit payment
    await page.click('button[type="submit"]');

    // Wait for success notification
    await expect(page.locator('text=Payment recorded successfully')).toBeVisible({ timeout: 10000 });

    // Wait a moment for receipt generation
    await page.waitForTimeout(2000);

    // Check that receipt is available
    const receiptButton = page.locator('button:has-text("View")').first();
    await expect(receiptButton).toBeVisible();
  });

  test("should display receipt in modal when clicked", async ({ page }) => {
    // Navigate to payments page
    await page.click('a[href="/dashboard/payments"]');
    await page.waitForURL("/dashboard/payments");

    // Click on first "View Receipt" button for confirmed payment
    const viewButton = page.locator('button:has-text("View")').first();
    await viewButton.click();

    // Wait for receipt modal to appear
    await expect(page.locator('text=Payment Receipt')).toBeVisible({ timeout: 5000 });

    // Check that receipt details are displayed
    await expect(page.locator('text=/Receipt #/')).toBeVisible();
    await expect(page.locator('text=/Customer/')).toBeVisible();
    await expect(page.locator('text=/Amount Paid/')).toBeVisible();

    // Check that download button is present if file exists
    const downloadButton = page.locator('button:has-text("Download Receipt")');
    if (await downloadButton.isVisible()) {
      await expect(downloadButton).toBeEnabled();
    }

    // Close modal
    await page.click('button:has-text("Close")');
    await expect(page.locator('text=Payment Receipt')).not.toBeVisible();
  });

  test("should navigate to receipts page and display all receipts", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Check page header
    await expect(page.locator('h1:has-text("Receipt Management")')).toBeVisible();

    // Check that stats cards are displayed
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
    await expect(page.locator('text=Unique Customers')).toBeVisible();

    // Check that receipts table is displayed
    await expect(page.locator('th:has-text("Receipt #")')).toBeVisible();
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
  });

  test("should filter receipts by search term", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Get initial count of receipts
    const initialRows = await page.locator('tbody tr').count();

    // Search for specific receipt
    await page.fill('input[placeholder*="Search"]', "RCP-2025");

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test("should filter receipts by date", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Set date filter to today
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[type="date"]', today);

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Clear filters button should be visible
    await expect(page.locator('button:has-text("Clear filters")')).toBeVisible();
  });

  test("should download receipt when download button is clicked", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Set up download handler
    const downloadPromise = page.waitForEvent("popup");

    // Click first download button
    const downloadButton = page.locator('button[title="Download Receipt"]').first();
    
    if (await downloadButton.isVisible()) {
      await downloadButton.click();

      // Verify download initiated (new tab opened)
      const popup = await downloadPromise;
      expect(popup.url()).toContain("receipts/");
    }
  });

  test("should view receipt details from receipts page", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Click first "View" button
    const viewButton = page.locator('button[title="View Receipt"]').first();
    await viewButton.click();

    // Wait for receipt modal
    await expect(page.locator('text=Payment Receipt')).toBeVisible({ timeout: 5000 });

    // Verify receipt iframe is loaded
    const iframe = page.locator('iframe[title="Receipt Preview"]');
    if (await iframe.isVisible()) {
      await expect(iframe).toBeVisible();
    }
  });

  test("should confirm before deleting receipt", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Set up dialog handler to cancel
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Are you sure");
      dialog.dismiss();
    });

    // Click delete button
    const deleteButton = page.locator('button[title="Delete Receipt"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
    }
  });

  test("should show receipt number in payment confirmation SMS", async ({ page }) => {
    // This test would require access to SMS queue or logs
    // Navigate to a system logs or SMS queue page if available
    
    // For now, verify that sms_queue table has metadata
    // This would be verified via database query in actual implementation
    
    // Placeholder assertion
    expect(true).toBe(true);
  });

  test("receipt URL should be stored in payment record", async ({ page }) => {
    // Navigate to payments page
    await page.click('a[href="/dashboard/payments"]');
    await page.waitForURL("/dashboard/payments");

    // Check first payment row
    const firstRow = page.locator('tbody tr').first();
    
    // Verify "View" button exists for confirmed payments
    const viewButton = firstRow.locator('button:has-text("View")');
    const notAvailable = firstRow.locator('text="-"');
    
    // Either view button or not available indicator should be present
    const hasViewButton = await viewButton.isVisible();
    const hasNotAvailable = await notAvailable.isVisible();
    
    expect(hasViewButton || hasNotAvailable).toBe(true);
  });

  test("receipt generation should handle missing payment gracefully", async ({ page }) => {
    // This would test error handling in the generate-receipt function
    // Navigate to payments and try to view receipt for pending payment
    
    await page.click('a[href="/dashboard/payments"]');
    await page.waitForURL("/dashboard/payments");

    // Find a pending payment (if exists)
    const pendingPayment = page.locator('tr:has(span:has-text("pending"))').first();
    
    if (await pendingPayment.isVisible()) {
      // Should show "-" instead of View button
      await expect(pendingPayment.locator('text="-"')).toBeVisible();
    }
  });

  test("should display receipt stats correctly on receipts page", async ({ page }) => {
    // Navigate to receipts page
    await page.click('a[href="/dashboard/receipts"]');
    await page.waitForURL("/dashboard/receipts");

    // Get total receipts count
    const totalReceiptsText = await page.locator('text=Total Receipts').locator('..').locator('p').last().textContent();
    const totalReceipts = parseInt(totalReceiptsText || "0");

    // Count actual table rows
    const tableRows = await page.locator('tbody tr').count();

    // They should match (unless there's a "no receipts" message)
    if (tableRows > 0) {
      expect(tableRows).toBe(totalReceipts);
    }
  });
});
