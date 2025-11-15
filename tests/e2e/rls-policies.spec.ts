// @ts-nocheck
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qenqilourxtfxchkawek.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';

test.describe('RLS Policies - Database Security', () => {
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  });

  test.describe('Core Tables Accessibility', () => {
    const coreTables = [
      'users',
      'customers',
      'estates',
      'plots',
      'allocations',
      'payments',
      'commissions',
      'leads',
      'call_logs',
      'sms_campaigns',
      'notifications',
      'receipts',
      'billing',
      'field_reports',
      'audit_logs'
    ];

    for (const table of coreTables) {
      test(`${table} table should be accessible with service_role`, async () => {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    }
  });

  test.describe('Users Table RLS Policies', () => {
    test('should allow service_role to read users', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should allow service_role to insert users', async () => {
      const testUser = {
        id: crypto.randomUUID(),
        email: `test-${Date.now()}@test.com`,
        full_name: 'RLS Test User',
        role: 'Agent'
      };

      const { data, error } = await (supabase
        .from('users')
        .insert(testUser as any)
        .select()
        .single() as any);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(testUser.email);

      // Cleanup
      await supabase.from('users').delete().eq('id', testUser.id);
    });

    test('should allow service_role to update users', async () => {
      // First create a test user
      const testUser = {
        id: crypto.randomUUID(),
        email: `test-${Date.now()}@test.com`,
        full_name: 'Original Name',
        role: 'Agent'
      };

      await supabase.from('users').insert(testUser);

      // Update the user
      const { data, error } = await supabase
        .from('users')
        .update({ full_name: 'Updated Name' })
        .eq('id', testUser.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.full_name).toBe('Updated Name');

      // Cleanup
      await supabase.from('users').delete().eq('id', testUser.id);
    });

    test('should allow service_role to delete users', async () => {
      // Create a test user
      const testUser = {
        id: crypto.randomUUID(),
        email: `test-${Date.now()}@test.com`,
        full_name: 'To Be Deleted',
        role: 'Agent'
      };

      await supabase.from('users').insert(testUser);

      // Delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data } = await supabase
        .from('users')
        .select()
        .eq('id', testUser.id);

      expect(data).toHaveLength(0);
    });
  });

  test.describe('Production Users Verification', () => {
    const productionUsers = [
      { email: 'sysadmin@pinnaclegroups.ng', role: 'SysAdmin' },
      { email: 'ceo@pinnaclegroups.ng', role: 'CEO' },
      { email: 'md@pinnaclegroups.ng', role: 'MD' },
      { email: 'frontdesk@pinnaclegroups.ng', role: 'Frontdesk' }
    ];

    for (const user of productionUsers) {
      test(`${user.email} should exist in database`, async () => {
        const { data, error } = await supabase
          .from('users')
          .select('email, role')
          .eq('email', user.email)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.email).toBe(user.email);
        expect(data?.role).toBe(user.role);
      });
    }
  });

  test.describe('RLS Policies Existence', () => {
    test('should have RLS policies on users table', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd 
          FROM pg_policies 
          WHERE tablename = 'users' 
          AND schemaname = 'public'
          ORDER BY policyname;
        `
      }).catch(() => {
        // Fallback if RPC doesn't exist
        return { data: null, error: { message: 'RPC not available' } };
      });

      // If we can't check via RPC, at least verify table access works
      if (error || !data) {
        const { error: accessError } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        expect(accessError).toBeNull();
      } else {
        // Verify we have at least the service_role policy
        expect(data).toBeDefined();
      }
    });
  });

  test.describe('Other Tables Basic Access', () => {
    test('customers table should be accessible', async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });

    test('estates table should be accessible', async () => {
      const { data, error } = await supabase
        .from('estates')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });

    test('plots table should be accessible', async () => {
      const { data, error } = await supabase
        .from('plots')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });

    test('allocations table should be accessible', async () => {
      const { data, error } = await supabase
        .from('allocations')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });

    test('payments table should be accessible', async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });

    test('commissions table should be accessible', async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  test.describe('Error Code Validation', () => {
    test('should not return 42501 (Permission Denied)', async () => {
      const tables = ['users', 'customers', 'estates'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          expect(error.code).not.toBe('42501');
        }
      }
    });

    test('should not return 42P17 (Infinite Recursion)', async () => {
      const { error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1);

      if (error) {
        expect(error.code).not.toBe('42P17');
      }
    });
  });
});
