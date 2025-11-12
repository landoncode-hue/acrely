import { test, expect } from "@playwright/test";

test.describe("Allocations Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@pinnaclegroups.ng");
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to allocations page", async ({ page }) => {
    await page.click('a[href="/dashboard/allocations"]');
    await expect(page).toHaveURL("/dashboard/allocations");
    await expect(page.locator("h1")).toContainText("Plot Allocations");
  });

  test("should open allocation creation modal", async ({ page }) => {
    await page.goto("/dashboard/allocations");
    await page.click('button:has-text("New Allocation")');
    
    await expect(page.locator('text="Allocate Plot to Customer"')).toBeVisible();
  });

  test("should create a new allocation", async ({ page }) => {
    await page.goto("/dashboard/allocations");
    await page.click('button:has-text("New Allocation")');

    // Select customer
    await page.selectOption('select[name="customer_id"]', { index: 1 });
    
    // Select plot
    await page.selectOption('select[name="plot_id"]', { index: 1 });
    
    // Select agent
    await page.selectOption('select[name="agent_id"]', { index: 1 });
    
    // Select payment plan
    await page.selectOption('select[name="payment_plan"]', "installment");
    
    // Fill installment details
    await page.fill('input[name="installment_count"]', "12");

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text="Plot allocated successfully"')).toBeVisible({ timeout: 5000 });
  });

  test("should filter allocations", async ({ page }) => {
    await page.goto("/dashboard/allocations");
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("estate");
    
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });
});
