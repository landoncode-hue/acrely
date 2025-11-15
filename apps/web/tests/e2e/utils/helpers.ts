import { Page, expect } from '@playwright/test';

/**
 * Wait for a toast notification to appear
 */
export async function waitForToast(
  page: Page,
  message?: string | RegExp,
  timeout: number = 5000
): Promise<void> {
  const toastSelector = '[class*="toast"], [role="alert"], [class*="notification"]';
  
  if (message) {
    await expect(page.locator(toastSelector, { hasText: message }))
      .toBeVisible({ timeout });
  } else {
    await expect(page.locator(toastSelector).first())
      .toBeVisible({ timeout });
  }
}

/**
 * Wait for network idle (useful after form submissions)
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 3000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Fill a form field by label text
 */
export async function fillByLabel(
  page: Page,
  labelText: string | RegExp,
  value: string
): Promise<void> {
  await page.getByLabel(labelText).fill(value);
}

/**
 * Click a button by text content
 */
export async function clickButton(
  page: Page,
  buttonText: string | RegExp
): Promise<void> {
  await page.getByRole('button', { name: buttonText }).click();
}

/**
 * Navigate to a dashboard section
 */
export async function navigateTo(
  page: Page,
  section: 'customers' | 'allocations' | 'payments' | 'reports' | 'analytics' | 'audit' | 'billing'
): Promise<void> {
  await page.click(`a[href*="/dashboard/${section}"]`);
  await page.waitForURL(`**/dashboard/${section}**`);
}

/**
 * Search in a table or list
 */
export async function searchFor(page: Page, query: string): Promise<void> {
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(query);
  await page.waitForTimeout(500); // Debounce
}

/**
 * Clear search input
 */
export async function clearSearch(page: Page): Promise<void> {
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill('');
  await page.waitForTimeout(500);
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const rows = page.locator('table tbody tr');
  return await rows.count();
}

/**
 * Check if modal/dialog is open
 */
export async function isModalOpen(page: Page): Promise<boolean> {
  const modal = page.getByRole('dialog').first();
  return await modal.isVisible();
}

/**
 * Close modal/dialog
 */
export async function closeModal(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: /close|cancel/i });
  await closeButton.click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    timestamp,
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    phone: `080${String(timestamp).slice(-8)}`,
  };
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for element to be stable (no animations)
 */
export async function waitForStable(
  page: Page,
  selector: string,
  timeout: number = 3000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForTimeout(300); // Allow animations to complete
}
