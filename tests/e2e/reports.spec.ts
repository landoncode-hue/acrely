import { test, expect } from "@playwright/test";

test.describe("Reports Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@pinnaclegroups.ng");
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to reports page", async ({ page }) => {
    await page.click('a[href="/dashboard/reports"]');
    await expect(page).toHaveURL("/dashboard/reports");
    await expect(page.locator("h1")).toContainText("Reports");
  });

  test("should display summary cards", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    // Check for summary cards
    await expect(page.locator('text="Total Revenue"')).toBeVisible();
    await expect(page.locator('text="Pending Commissions"')).toBeVisible();
    await expect(page.locator('text="Active Estates"')).toBeVisible();
  });

  test("should display charts", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    // Verify charts are rendered
    await expect(page.locator('text="Revenue Trend"')).toBeVisible();
    await expect(page.locator('text="Commission Status"')).toBeVisible();
    await expect(page.locator('text="Revenue by Estate"')).toBeVisible();
  });

  test("should change date range filter", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    const dateRangeSelect = page.locator('select');
    await dateRangeSelect.selectOption("month");
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify page still displays correctly
    await expect(page.locator("h1")).toContainText("Reports");
  });

  test("should export to CSV", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    // Setup download handler
    const downloadPromise = page.waitForEvent("download");
    
    // Click CSV export button
    await page.click('button:has-text("CSV")');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("should display monthly revenue table", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    // Check table exists
    await expect(page.locator('text="Monthly Revenue Performance"')).toBeVisible();
    
    // Verify table has data
    const tableRows = page.locator("table tbody tr");
    await expect(tableRows.first()).toBeVisible();
  });

  test("should display estate performance table", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    await expect(page.locator('text="Estate Performance"')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('th:has-text("Total Plots")')).toBeVisible();
    await expect(page.locator('th:has-text("Available")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
  });

  test("should display commission summary", async ({ page }) => {
    await page.goto("/dashboard/reports");
    
    await expect(page.locator('text="Agent Commission Summary"')).toBeVisible();
    
    // Verify columns
    await expect(page.locator('th:has-text("Agent")')).toBeVisible();
    await expect(page.locator('th:has-text("Pending")')).toBeVisible();
    await expect(page.locator('th:has-text("Paid")')).toBeVisible();
  });
});
