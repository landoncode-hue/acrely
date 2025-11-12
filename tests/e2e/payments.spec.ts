import { test, expect } from "@playwright/test";

test.describe("Payments Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@pinnaclegroups.ng");
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to payments page", async ({ page }) => {
    await page.click('a[href="/dashboard/payments"]');
    await expect(page).toHaveURL("/dashboard/payments");
    await expect(page.locator("h1")).toContainText("Payments");
  });

  test("should open payment recording modal", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await page.click('button:has-text("Record Payment")');
    
    await expect(page.locator('text="Record Payment"')).toBeVisible();
  });

  test("should record a new payment", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await page.click('button:has-text("Record Payment")');

    // Select allocation
    await page.selectOption('select[name="allocation_id"]', { index: 1 });
    
    // Fill amount
    await page.fill('input[name="amount"]', "50000");
    
    // Select payment method
    await page.selectOption('select[name="payment_method"]', "bank_transfer");

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text="Payment recorded successfully"')).toBeVisible({ timeout: 5000 });
  });

  test("should display payment details correctly", async ({ page }) => {
    await page.goto("/dashboard/payments");
    
    // Check table headers
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('th:has-text("Reference")')).toBeVisible();
  });

  test("should search payments", async ({ page }) => {
    await page.goto("/dashboard/payments");
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("PAY");
    
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });
});
