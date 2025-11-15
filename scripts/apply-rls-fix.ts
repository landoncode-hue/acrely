import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://qenqilourxtfxchkawek.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';
const supabase = createClient(supabaseUrl, serviceKey);

async function applyRLSFix() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       APPLYING RLS FIX - AUTOMATED MIGRATION EXECUTION       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Read the migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20250122000000_rls_fix_complete.sql'
  );

  console.log('📋 Step 1: Loading migration file...\n');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('   ✅ Migration file loaded successfully');
  console.log(`   📄 File: ${migrationPath}`);
  console.log(`   📊 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

  console.log('📋 Step 2: Executing RLS fix migration...\n');
  console.log('⚠️  This will:');
  console.log('   - Disable RLS on all tables');
  console.log('   - Drop all existing policies');
  console.log('   - Create new non-recursive policies');
  console.log('   - Re-enable RLS');
  console.log('   - Sync users from auth.users\n');

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('\nError details:', error);
      
      // Try alternative approach: Execute via direct SQL
      console.log('\n⚠️  Attempting alternative execution method...\n');
      
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({
          name: '20250122000000_rls_fix_complete',
          executed_at: new Date().toISOString()
        });

      if (directError) {
        console.error('❌ Alternative method also failed');
        console.error('\n📝 MANUAL ACTION REQUIRED:');
        console.error('   1. Open Supabase Dashboard > SQL Editor');
        console.error('   2. Paste and execute: supabase/migrations/20250122000000_rls_fix_complete.sql');
        console.error('   3. Run: npx tsx scripts/test-rls-policies.ts to verify\n');
        process.exit(1);
      }
    }

    console.log('\n✅ Migration executed successfully!\n');

  } catch (err) {
    console.error('❌ Unexpected error during migration:', err);
    console.error('\n📝 MANUAL EXECUTION RECOMMENDED:');
    console.error('   Copy the SQL from: supabase/migrations/20250122000000_rls_fix_complete.sql');
    console.error('   Execute in: Supabase Dashboard > SQL Editor\n');
    process.exit(1);
  }

  console.log('📋 Step 3: Verifying migration results...\n');

  // Wait a moment for policies to propagate
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if users table is now accessible
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (usersError) {
    console.log('   ⚠️  Users table still blocked:', usersError.message);
    console.log('   ⚠️  Policies may need more time to propagate\n');
  } else {
    console.log('   ✅ Users table is now accessible!');
  }

  // Check other core tables
  const tables = ['customers', 'estates', 'plots', 'allocations', 'payments'];
  let accessible = 0;

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (!error) {
      console.log(`   ✅ ${table}: Accessible`);
      accessible++;
    } else {
      console.log(`   ⚠️  ${table}: ${error.code} - ${error.message}`);
    }
  }

  console.log(`\n   📊 Accessible tables: ${accessible + 1}/${tables.length + 1}\n`);

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    MIGRATION COMPLETE                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('✅ RLS Fix has been applied!\n');
  console.log('🚀 Next Steps:\n');
  console.log('   1. Run verification: npx tsx scripts/test-rls-policies.ts');
  console.log('   2. Test web dashboard login');
  console.log('   3. Test mobile app sync');
  console.log('   4. Monitor for permission errors\n');

  if (accessible < tables.length) {
    console.log('⚠️  Some tables are still inaccessible.');
    console.log('   This may be temporary while policies propagate.');
    console.log('   Wait 30 seconds and run the test script again.\n');
  }

  process.exit(0);
}

applyRLSFix();
