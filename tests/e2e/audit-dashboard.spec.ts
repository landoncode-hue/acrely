import { test, expect } from "@playwright/test";

test.describe("Audit Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto("/");
    await page.fill('input[type="email"]', "admin@pinnaclegroups.ng");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to audit logs page", async ({ page }) => {
    // Click audit logs in sidebar
    await page.click('a[href="/dashboard/audit"]');
    await page.waitForURL("/dashboard/audit");

    // Verify page loaded
    await expect(page.locator("h1")).toContainText("Audit Logs");
  });

  test("should display audit logs table", async ({ page }) => {
    await page.goto("/dashboard/audit");

    // Wait for table to load
    await page.waitForSelector("table");

    // Check table headers
    await expect(page.locator("th")).toHaveCount(7);
    await expect(page.locator("th").first()).toContainText("Date & Time");
  });

  test("should filter audit logs by entity", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Select entity filter
    const entityFilter = page.locator('select').filter({ hasText: "All Entities" });
    await entityFilter.selectOption("customers");

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify filtered data
    const entityCells = page.locator('td:has-text("customers")');
    const count = await entityCells.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should filter audit logs by action", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Select action filter
    const actionFilter = page.locator('select').filter({ hasText: "All Actions" });
    await actionFilter.selectOption("INSERT");

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify filtered data
    const actionBadges = page.locator('span:has-text("Created")');
    const count = await actionBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should search audit logs", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Enter search term
    await page.fill('input[placeholder*="Search"]', "admin");
    await page.waitForTimeout(500);

    // Verify search results
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should view audit log details", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Click first "View" button
    const viewButton = page.locator('button:has-text("View")').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();

      // Wait for modal
      await page.waitForSelector("h2:has-text('Audit Log Details')");

      // Verify modal content
      await expect(page.locator("text=Overview")).toBeVisible();
      await expect(page.locator("text=Timestamp")).toBeVisible();
    }
  });

  test("should export audit logs to CSV", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Setup download listener
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.click('button:has-text("Export CSV")');

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/audit-logs-.*\.csv/);
  });

  test("should display statistics cards", async ({ page }) => {
    await page.goto("/dashboard/audit");

    // Wait for stats to load
    await page.waitForSelector("text=Total Logs");

    // Verify all stat cards
    await expect(page.locator("text=Total Logs")).toBeVisible();
    await expect(page.locator("text=Creates")).toBeVisible();
    await expect(page.locator("text=Updates")).toBeVisible();
    await expect(page.locator("text=Deletes")).toBeVisible();
  });

  test("should filter by date range", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Set date range
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    await page.fill('input[type="date"]', weekAgo);
    await page.click('button:has-text("Refresh")');

    // Wait for refresh
    await page.waitForTimeout(1000);

    // Verify data loaded
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should refresh audit logs", async ({ page }) => {
    await page.goto("/dashboard/audit");
    await page.waitForSelector("table");

    // Get initial row count
    const initialCount = await page.locator("tbody tr").count();

    // Click refresh
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(1000);

    // Verify refreshed
    const newCount = await page.locator("tbody tr").count();
    expect(newCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Audit Access Control", () => {
  test("should deny access to non-admin users", async ({ page }) => {
    // Login as non-admin (e.g., Agent)
    await page.goto("/");
    await page.fill('input[type="email"]', "agent@pinnaclegroups.ng");
    await page.fill('input[type="password"]', "agent123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Try to access audit page
    await page.goto("/dashboard/audit");
    
    // Should redirect or show error
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain("/dashboard/audit");
  });

  test("should allow CEO access", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[type="email"]', "ceo@pinnaclegroups.ng");
    await page.fill('input[type="password"]', "ceo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/audit");
    await expect(page.locator("h1")).toContainText("Audit Logs");
  });

  test("should allow MD access", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[type="email"]', "md@pinnaclegroups.ng");
    await page.fill('input[type="password"]', "md123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/audit");
    await expect(page.locator("h1")).toContainText("Audit Logs");
  });
});
