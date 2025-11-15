/**
 * E2E Test Utilities Index
 * 
 * Central export file for all test utilities
 * Import from here to access all helpers, login functions, and test data generators
 */

// Login utilities
export {
  loginAs,
  loginWithCredentials,
  logout,
  isAuthenticated,
  TEST_USERS,
  type UserRole,
} from './login';

// Database seeding utilities
export {
  resetTestDatabase,
  seedTestUsers,
  seedTestCustomers,
  cleanupTestData,
  verifyTestEnvironment,
} from './seed';

// Helper utilities
export {
  waitForToast,
  waitForNetworkIdle,
  fillByLabel,
  clickButton,
  navigateTo,
  searchFor,
  clearSearch,
  getTableRowCount,
  isModalOpen,
  closeModal,
  generateTestData,
  takeScreenshot,
  waitForStable,
} from './helpers';

/**
 * Usage Example:
 * 
 * import { loginAs, navigateTo, generateTestData, waitForToast } from '../utils';
 * 
 * test('my test', async ({ page }) => {
 *   await loginAs(page, 'admin');
 *   await navigateTo(page, 'customers');
 *   
 *   const testData = generateTestData();
 *   // ... rest of test
 * });
 */
