import { test, expect } from '@playwright/test';

/**
 * API Validation Tests
 * Validates all backend API endpoints
 */

test.describe('API Validation', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@pinnaclegroups.ng',
        password: 'Test@123'
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      authToken = data.token || data.access_token;
    }
  });

  test('GET /api/audit - audit logs endpoint', async ({ request }) => {
    const response = await request.get('/api/audit', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data) || data.data).toBeTruthy();
  });

  test('GET /api/billing - billing endpoint', async ({ request }) => {
    const response = await request.get('/api/billing', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/customers - customers endpoint', async ({ request }) => {
    const response = await request.get('/api/customers', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data) || data.customers).toBeTruthy();
  });

  test('GET /api/allocations - allocations endpoint', async ({ request }) => {
    const response = await request.get('/api/allocations', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
  });

  test('GET /api/payments - payments endpoint', async ({ request }) => {
    const response = await request.get('/api/payments', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
  });

  test('GET /api/receipts - receipts endpoint', async ({ request }) => {
    const response = await request.get('/api/receipts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
  });

  test('GET /api/field-reports - field reports endpoint', async ({ request }) => {
    const response = await request.get('/api/field-reports', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
  });

  test('GET /api/analytics - analytics endpoint', async ({ request }) => {
    const response = await request.get('/api/analytics', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('unauthorized requests return 401', async ({ request }) => {
    const response = await request.get('/api/customers');
    expect([401, 403]).toContain(response.status());
  });

  test('invalid endpoints return 404', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(404);
  });
});
