import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qenqilourxtfxchkawek.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';
const supabase = createClient(supabaseUrl, serviceKey);

async function testRLSPolicies() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              RLS POLICIES - SECURITY TEST SUITE              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const tables = ['users', 'customers', 'estates', 'plots', 'allocations', 'payments', 'commissions', 'leads'];
  let passed = 0;
  let failed = 0;

  // Test 1: Core Tables Accessibility
  console.log('📋 TEST SUITE 1: Core Tables Accessibility\n');
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      if (error.code === '42501') {
        console.log(`   ❌ ${table}: BLOCKED (RLS Permission Denied)`);
        failed++;
      } else if (error.code === '42P17') {
        console.log(`   ❌ ${table}: INFINITE RECURSION`);
        failed++;
      } else {
        console.log(`   ⚠️  ${table}: ${error.message}`);
        failed++;
      }
    } else {
      console.log(`   ✅ ${table}: accessible`);
      passed++;
    }
  }

  // Test 2: Production Users
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
      .select('email, role')
      .eq('email', user.email)
      .single();

    if (error) {
      console.log(`   ❌ ${user.email}: NOT FOUND (${error.message})`);
      failed++;
    } else if (data?.role === user.role) {
      console.log(`   ✅ ${user.email}: verified (${user.role})`);
      passed++;
    } else {
      console.log(`   ⚠️  ${user.email}: wrong role (expected ${user.role}, got ${data?.role})`);
      failed++;
    }
  }

  // Test 3: CRUD Operations
  console.log('\n🔧 TEST SUITE 3: CRUD Operations on Users Table\n');

  // Create
  const testUser = {
    id: crypto.randomUUID(),
    email: `rls-test-${Date.now()}@test.com`,
    full_name: 'RLS Test User',
    role: 'Agent'
  };

  const { data: created, error: createError } = await supabase
    .from('users')
    .insert(testUser)
    .select()
    .single();

  if (createError) {
    console.log(`   ❌ CREATE: Failed (${createError.message})`);
    failed++;
  } else {
    console.log(`   ✅ CREATE: User inserted successfully`);
    passed++;

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ full_name: 'Updated Name' })
      .eq('id', testUser.id)
      .select()
      .single();

    if (updateError) {
      console.log(`   ❌ UPDATE: Failed (${updateError.message})`);
      failed++;
    } else {
      console.log(`   ✅ UPDATE: User updated successfully`);
      passed++;
    }

    // Delete
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);

    if (deleteError) {
      console.log(`   ❌ DELETE: Failed (${deleteError.message})`);
      failed++;
    } else {
      console.log(`   ✅ DELETE: User deleted successfully`);
      passed++;
    }
  }

  // Results
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST RESULTS                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📊 Success Rate: ${percentage}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL RLS TESTS PASSED - Database is secure and accessible!\n');
    process.exit(0);
  } else if (percentage >= 70) {
    console.log('⚠️  SOME RLS TESTS FAILED - Review security policies\n');
    process.exit(1);
  } else {
    console.log('🔴 CRITICAL: Most RLS tests failed - Database access blocked!\n');
    console.log('   ACTION REQUIRED: Run the SQL fix in Supabase Dashboard\n');
    process.exit(1);
  }
}

testRLSPolicies();
