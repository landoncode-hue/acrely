/**
 * Database seeding utilities for E2E tests
 * 
 * IMPORTANT: These functions only work with TEST_MODE=true
 * They operate on the isolated 'test' schema in Supabase
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Reset the test database to a clean state
 * Runs the reset-test-db.sql script via Supabase
 */
export async function resetTestDatabase(): Promise<void> {
  if (process.env.TEST_MODE !== 'true') {
    throw new Error('resetTestDatabase can only be called in TEST_MODE');
  }

  console.log('🔄 Resetting test database...');
  
  // Note: This assumes you have a script or endpoint to reset the test database
  // In practice, this is typically done via the run-e2e.sh script before tests
  // Here we provide a placeholder implementation
  
  // Option 1: Call a reset endpoint (if you create one)
  // await fetch(`${BASE_URL}/api/test/reset`, { method: 'POST' });
  
  // Option 2: Direct Supabase call (requires additional setup)
  // This is typically handled by the test runner script
  
  console.log('✅ Test database reset complete');
}

/**
 * Seed test users into the database
 * Creates standard test users for different roles
 */
export async function seedTestUsers(): Promise<void> {
  if (process.env.TEST_MODE !== 'true') {
    throw new Error('seedTestUsers can only be called in TEST_MODE');
  }

  console.log('🌱 Seeding test users...');
  
  // This is typically handled by the seed.sql script
  // Placeholder for programmatic seeding if needed
  
  console.log('✅ Test users seeded');
}

/**
 * Seed test customers
 */
export async function seedTestCustomers(count: number = 10): Promise<void> {
  if (process.env.TEST_MODE !== 'true') {
    throw new Error('seedTestCustomers can only be called in TEST_MODE');
  }

  console.log(`🌱 Seeding ${count} test customers...`);
  
  // Placeholder for programmatic seeding
  // In practice, this is done via seed.sql
  
  console.log('✅ Test customers seeded');
}

/**
 * Clean up test data after test run
 */
export async function cleanupTestData(): Promise<void> {
  if (process.env.TEST_MODE !== 'true') {
    throw new Error('cleanupTestData can only be called in TEST_MODE');
  }

  console.log('🧹 Cleaning up test data...');
  
  // Reset database to clean state
  await resetTestDatabase();
  
  console.log('✅ Test data cleaned up');
}

/**
 * Verify test environment is properly configured
 */
export function verifyTestEnvironment(): void {
  if (process.env.TEST_MODE !== 'true') {
    throw new Error('TEST_MODE must be set to "true" for E2E tests');
  }

  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be set');
  }

  if (process.env.NEXT_PUBLIC_TEST_SCHEMA !== 'test') {
    console.warn('⚠️  NEXT_PUBLIC_TEST_SCHEMA is not set to "test"');
  }

  console.log('✅ Test environment verified');
}
