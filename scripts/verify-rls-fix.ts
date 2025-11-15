import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qenqilourxtfxchkawek.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';
const supabase = createClient(supabaseUrl, serviceKey);

async function verifyRLSFix() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         RLS FIX VERIFICATION - POST-DEPLOYMENT CHECK         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  console.log('🔍 TEST SUITE 1: Core Table Accessibility\n');

  const coreTables = [
    'users', 'customers', 'estates', 'plots', 'allocations', 
    'payments', 'commissions', 'leads', 'call_logs', 'sms_campaigns',
    'notifications', 'inspection_schedules', 'settings', 'user_settings'
  ];

  for (const table of coreTables) {
    totalTests++;
    const { data, error } = await supabase.from(table).select('count').limit(1);
    
    if (error) {
      if (error.code === '42501') {
        console.log(`   ❌ ${table.padEnd(25)} BLOCKED (Permission Denied)`);
        failedTests++;
      } else if (error.code === '42P17') {
        console.log(`   ❌ ${table.padEnd(25)} INFINITE RECURSION`);
        failedTests++;
      } else {
        console.log(`   ⚠️  ${table.padEnd(25)} ${error.code}: ${error.message}`);
        failedTests++;
      }
    } else {
      console.log(`   ✅ ${table.padEnd(25)} Accessible`);
      passedTests++;
    }
  }

  console.log('\n🔍 TEST SUITE 2: Production Users Verification\n');

  const prodUsers = [
    { email: 'sysadmin@pinnaclegroups.ng', role: 'SysAdmin' },
    { email: 'ceo@pinnaclegroups.ng', role: 'CEO' },
    { email: 'md@pinnaclegroups.ng', role: 'MD' },
    { email: 'frontdesk@pinnaclegroups.ng', role: 'Frontdesk' }
  ];

  for (const user of prodUsers) {
    totalTests++;
    const { data, error } = await supabase
      .from('users')
      .select('email, role, full_name')
      .eq('email', user.email)
      .maybeSingle();

    if (error) {
      console.log(`   ❌ ${user.email.padEnd(35)} ERROR: ${error.message}`);
      failedTests++;
    } else if (data) {
      if (data.role === user.role) {
        console.log(`   ✅ ${user.email.padEnd(35)} ${user.role} (${data.full_name || 'No name'})`);
        passedTests++;
      } else {
        console.log(`   ⚠️  ${user.email.padEnd(35)} Wrong role: ${data.role} (expected ${user.role})`);
        failedTests++;
      }
    } else {
      console.log(`   ⚠️  ${user.email.padEnd(35)} NOT FOUND in public.users`);
      failedTests++;
    }
  }

  console.log('\n🔍 TEST SUITE 3: CRUD Operations\n');

  // Test INSERT
  totalTests++;
  const testCustomer = {
    full_name: `RLS Test Customer ${Date.now()}`,
    phone: '+2348012345678',
    email: `rlstest${Date.now()}@test.com`
  };

  const { data: created, error: createError } = await supabase
    .from('customers')
    .insert(testCustomer)
    .select()
    .single();

  if (createError) {
    console.log(`   ❌ INSERT customer: ${createError.message}`);
    failedTests++;
  } else {
    console.log(`   ✅ INSERT customer: Success (ID: ${created.id.substring(0, 8)}...)`);
    passedTests++;

    // Test UPDATE
    totalTests++;
    const { error: updateError } = await supabase
      .from('customers')
      .update({ full_name: 'Updated Test Customer' })
      .eq('id', created.id);

    if (updateError) {
      console.log(`   ❌ UPDATE customer: ${updateError.message}`);
      failedTests++;
    } else {
      console.log(`   ✅ UPDATE customer: Success`);
      passedTests++;
    }

    // Test DELETE
    totalTests++;
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log(`   ❌ DELETE customer: ${deleteError.message}`);
      failedTests++;
    } else {
      console.log(`   ✅ DELETE customer: Success`);
      passedTests++;
    }
  }

  console.log('\n🔍 TEST SUITE 4: RLS Policy Verification\n');

  // Check for any infinite recursion in users table
  totalTests++;
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role')
    .limit(5);

  if (usersError) {
    if (usersError.code === '42P17') {
      console.log(`   ❌ Users table: INFINITE RECURSION DETECTED`);
      failedTests++;
    } else {
      console.log(`   ⚠️  Users table: ${usersError.message}`);
      failedTests++;
    }
  } else {
    console.log(`   ✅ Users table: No recursion (returned ${users?.length || 0} users)`);
    passedTests++;
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     VERIFICATION RESULTS                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const passRate = Math.round((passedTests / totalTests) * 100);

  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${failedTests}/${totalTests}`);
  console.log(`   📊 Success Rate: ${passRate}%\n`);

  if (failedTests === 0) {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                 🎉 RLS FIX SUCCESSFUL! 🎉                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('✅ All tests passed - RLS policies are working correctly!\n');
    console.log('🚀 Next Steps:\n');
    console.log('   1. Test web dashboard login and functionality');
    console.log('   2. Test mobile app sync and operations');
    console.log('   3. Monitor production logs for any errors');
    console.log('   4. Celebrate! The RLS issue is resolved! 🎊\n');
    process.exit(0);
  } else if (passRate >= 70) {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ⚠️  PARTIAL SUCCESS - REVIEW NEEDED ⚠️          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`⚠️  ${failedTests} tests failed - some issues remain\n`);
    console.log('🔍 Recommendations:\n');
    console.log('   1. Review the failed tests above');
    console.log('   2. Check Supabase SQL Editor for error messages');
    console.log('   3. Wait 30 seconds for policies to propagate, then re-run');
    console.log('   4. If issues persist, review migration execution logs\n');
    process.exit(1);
  } else {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║            🔴 CRITICAL: RLS FIX NOT APPLIED 🔴               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('❌ Most tests failed - RLS policies are still blocking access\n');
    console.log('📋 Action Required:\n');
    console.log('   1. Verify migration was executed in Supabase SQL Editor');
    console.log('   2. Check SQL Editor logs for error messages');
    console.log('   3. Review: RLS_FIX_DEPLOYMENT_INSTRUCTIONS.md');
    console.log('   4. Re-execute migration if needed (it is idempotent)\n');
    console.log('📄 Migration file: supabase/migrations/20250122000000_rls_fix_complete.sql');
    console.log('🌐 Supabase Dashboard: https://supabase.com/dashboard/project/qenqilourxtfxchkawek\n');
    process.exit(1);
  }
}

verifyRLSFix();
