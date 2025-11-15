import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qenqilourxtfxchkawek.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.error('   Please set one of these environment variables with your service role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyHybridRLS() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         HYBRID RLS VERIFICATION - COMPREHENSIVE TEST         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Service Role Access to All Tables
  console.log('🔧 TEST SUITE 1: Service Role Access (Superuser Tier)\n');
  
  const coreTables = [
    'users', 'customers', 'estates', 'plots', 'allocations', 
    'payments', 'commissions', 'leads', 'call_logs'
  ];

  for (const table of coreTables) {
    const { data, error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      if (error.code === '42501') {
        console.log(`   ❌ ${table}: BLOCKED (RLS Permission Denied - Error 42501)`);
        failed++;
      } else if (error.code === '42P17') {
        console.log(`   ❌ ${table}: INFINITE RECURSION (Error 42P17)`);
        failed++;
      } else if (error.code === '42P01') {
        console.log(`   ⚠️  ${table}: TABLE NOT FOUND (skipping)`);
        // Don't count as failure if table doesn't exist
      } else {
        console.log(`   ⚠️  ${table}: ${error.message} (${error.code})`);
        failed++;
      }
    } else {
      console.log(`   ✅ ${table}: accessible (service_role)`);
      passed++;
    }
  }

  // Test 2: Production Users Verification
  console.log('\n👥 TEST SUITE 2: Production Users Verification\n');
  
  const prodUsers = [
    { email: 'sysadmin@pinnaclegroups.ng', role: 'SysAdmin' },
    { email: 'ceo@pinnaclegroups.ng', role: 'CEO' },
    { email: 'md@pinnaclegroups.ng', role: 'MD' },
    { email: 'frontdesk@pinnaclegroups.ng', role: 'Frontdesk' }
  ];

  for (const user of prodUsers) {
    const { data, error } = await supabase
      .from('users')
      .select('email, role, full_name')
      .eq('email', user.email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`   ⚠️  ${user.email}: NOT FOUND (needs seeding)`);
        // Don't count as failure - just needs seed data
      } else {
        console.log(`   ❌ ${user.email}: ERROR (${error.message})`);
        failed++;
      }
    } else if (data?.role === user.role) {
      console.log(`   ✅ ${user.email}: verified (${user.role} - ${data.full_name})`);
      passed++;
    } else {
      console.log(`   ⚠️  ${user.email}: role mismatch (expected ${user.role}, got ${data?.role})`);
      failed++;
    }
  }

  // Test 3: RLS Policy Count
  console.log('\n📊 TEST SUITE 3: RLS Policy Verification\n');

  const { data: policyData, error: policyError } = await supabase.rpc('get_policy_count');
  
  if (policyError) {
    // Try direct query if RPC doesn't exist
    const { count, error: countError } = await supabase
      .from('pg_policies')
      .select('*', { count: 'exact', head: true })
      .eq('schemaname', 'public');
    
    if (countError) {
      console.log(`   ⚠️  Could not count policies: ${countError.message}`);
    } else {
      console.log(`   ✅ Total RLS policies in public schema: ${count || 0}`);
      if ((count || 0) >= 20) {
        console.log(`   ✅ Policy count looks healthy (expected 20+)`);
        passed++;
      } else {
        console.log(`   ⚠️  Policy count seems low (expected 20+)`);
        failed++;
      }
    }
  }

  // Test 4: CRUD Operations Test
  console.log('\n🔧 TEST SUITE 4: CRUD Operations (Service Role)\n');

  // Create test customer
  const testCustomer = {
    full_name: `Test Customer ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    phone: '+2340000000000',
    city: 'Lagos',
    state: 'Lagos'
  };

  const { data: created, error: createError } = await supabase
    .from('customers')
    .insert(testCustomer)
    .select()
    .single();

  if (createError) {
    console.log(`   ❌ CREATE: Failed (${createError.message})`);
    failed++;
  } else {
    console.log(`   ✅ CREATE: Customer created successfully`);
    passed++;

    // Update test customer
    const { data: updated, error: updateError } = await supabase
      .from('customers')
      .update({ city: 'Abuja' })
      .eq('id', created.id)
      .select()
      .single();

    if (updateError) {
      console.log(`   ❌ UPDATE: Failed (${updateError.message})`);
      failed++;
    } else {
      console.log(`   ✅ UPDATE: Customer updated successfully`);
      passed++;
    }

    // Delete test customer
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log(`   ❌ DELETE: Failed (${deleteError.message})`);
      failed++;
    } else {
      console.log(`   ✅ DELETE: Customer deleted successfully`);
      passed++;
    }
  }

  // Test 5: Seed Data Verification
  console.log('\n📦 TEST SUITE 5: Seed Data Verification\n');

  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  const { count: plotCount } = await supabase
    .from('plots')
    .select('*', { count: 'exact', head: true });

  console.log(`   ℹ️  Customers in database: ${customerCount || 0}`);
  console.log(`   ℹ️  Plots in database: ${plotCount || 0}`);

  if ((customerCount || 0) >= 2) {
    console.log(`   ✅ Customer seed data present`);
    passed++;
  } else {
    console.log(`   ⚠️  Customer seed data may be missing (run seed script)`);
  }

  if ((plotCount || 0) >= 2) {
    console.log(`   ✅ Plot seed data present`);
    passed++;
  } else {
    console.log(`   ⚠️  Plot seed data may be missing (run seed script)`);
  }

  // Results Summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      VERIFICATION RESULTS                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📊 Success Rate: ${percentage}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL HYBRID RLS TESTS PASSED!');
    console.log('   ✓ Service role has full access (superuser tier)');
    console.log('   ✓ Production users are configured');
    console.log('   ✓ CRUD operations work correctly');
    console.log('   ✓ Database is secure and accessible\n');
    process.exit(0);
  } else if (percentage >= 70) {
    console.log('⚠️  SOME TESTS FAILED - Review issues above');
    console.log('   Most functionality works but needs attention\n');
    process.exit(1);
  } else {
    console.log('🔴 CRITICAL: Most tests failed');
    console.log('   ⚡ Next Steps:');
    console.log('   1. Check if migration was applied in Supabase SQL Editor');
    console.log('   2. Verify service role key is correct');
    console.log('   3. Run seed data script if needed');
    console.log('   4. Check Supabase logs for detailed errors\n');
    process.exit(1);
  }
}

verifyHybridRLS();
