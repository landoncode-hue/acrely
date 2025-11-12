import { test, expect } from "@playwright/test";

test.describe("Customer Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@pinnaclegroups.ng");
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should navigate to customers page", async ({ page }) => {
    await page.click('a[href="/dashboard/customers"]');
    await expect(page).toHaveURL("/dashboard/customers");
    await expect(page.locator("h1")).toContainText("Customers");
  });

  test("should open customer creation modal", async ({ page }) => {
    await page.goto("/dashboard/customers");
    await page.click('button:has-text("Add Customer")');
    
    // Wait for modal to appear
    await expect(page.locator('text="Add New Customer"')).toBeVisible();
  });

  test("should create a new customer", async ({ page }) => {
    await page.goto("/dashboard/customers");
    await page.click('button:has-text("Add Customer")');

    // Fill in customer details
    await page.fill('input[name="full_name"]', "Test Customer");
    await page.fill('input[name="phone"]', "+2348012345678");
    await page.fill('input[name="email"]', "testcustomer@example.com");
    await page.fill('input[name="city"]', "Lagos");
    await page.fill('input[name="state"]', "Lagos");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success notification
    await expect(page.locator('text="Customer created successfully"')).toBeVisible({ timeout: 5000 });
  });

  test("should search for customers", async ({ page }) => {
    await page.goto("/dashboard/customers");
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Test");
    
    // Verify search results update
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
    await expect(rows).not.toHaveCount(0);
  });

  test("should edit a customer", async ({ page }) => {
    await page.goto("/dashboard/customers");
    
    // Click the first edit button
    await page.click('tbody tr:first-child button[title="Edit"]');
    
    // Wait for modal
    await expect(page.locator('text="Edit Customer"')).toBeVisible();
    
    // Update customer name
    const nameInput = page.locator('input[name="full_name"]');
    await nameInput.fill("Updated Customer Name");
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text="Customer updated successfully"')).toBeVisible({ timeout: 5000 });
  });

  test("should delete a customer", async ({ page }) => {
    await page.goto("/dashboard/customers");
    
    // Setup dialog handler before clicking
    page.on("dialog", (dialog) => dialog.accept());
    
    // Click delete button
    await page.click('tbody tr:first-child button[title="Delete"]');
    
    // Verify success
    await expect(page.locator('text="Customer deleted successfully"')).toBeVisible({ timeout: 5000 });
  });
});
