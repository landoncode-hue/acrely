import { Page } from '@playwright/test';

/**
 * Test User Credentials
 * These should match the seeded test users in your test database
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    role: 'SysAdmin',
  },
  agent: {
    email: 'agent@test.com',
    password: 'password123',
    role: 'Agent',
  },
  frontdesk: {
    email: 'frontdesk@test.com',
    password: 'password123',
    role: 'Frontdesk',
  },
  ceo: {
    email: 'ceo@test.com',
    password: 'password123',
    role: 'CEO',
  },
  md: {
    email: 'md@test.com',
    password: 'password123',
    role: 'MD',
  },
} as const;

export type UserRole = keyof typeof TEST_USERS;

/**
 * Login helper function for E2E tests
 * Uses the test schema when TEST_MODE=true
 * 
 * @param page - Playwright page instance
 * @param role - User role to login as (admin, agent, frontdesk, ceo, md)
 * @param waitForDashboard - Whether to wait for dashboard navigation (default: true)
 */
export async function loginAs(
  page: Page,
  role: UserRole = 'admin',
  waitForDashboard: boolean = true
): Promise<void> {
  const user = TEST_USERS[role];

  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input#email', user.email);
  await page.fill('input#password', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  if (waitForDashboard) {
    // Wait for successful navigation
    // CEO/MD/SysAdmin redirect to analytics, others to dashboard
    const expectedPath = ['CEO', 'MD', 'SysAdmin'].includes(user.role)
      ? '/dashboard/analytics'
      : '/dashboard';

    await page.waitForURL(expectedPath, { timeout: 10000 });
  }
}

/**
 * Login with custom credentials
 * Useful for testing different scenarios
 */
export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
  expectSuccess: boolean = true
): Promise<void> {
  await page.goto('/login');
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');

  if (expectSuccess) {
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}

/**
 * Logout helper function
 */
export async function logout(page: Page): Promise<void> {
  // Click user dropdown
  await page.click('button:has-text("Sign Out"), button:has-text("Logout")');
  
  // Wait for redirect to login
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForURL(/\/dashboard/, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
