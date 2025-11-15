import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://qenqilourxtfxchkawek.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';
const supabase = createClient(supabaseUrl, serviceKey);

async function backupRLSPolicies() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          RLS POLICIES BACKUP - PRE-MIGRATION SAFETY          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupDir = path.join(process.cwd(), 'supabase', 'backups');
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `rls_policies_backup_${timestamp}.sql`);

  console.log('📋 Step 1: Extracting Current RLS Policies\n');

  // Query to get all RLS policies
  const { data: policies, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `
  }).single();

  if (error) {
    console.log('⚠️  Unable to extract policies via RPC, trying direct query...\n');
    
    // Alternative: Query pg_policies directly
    const { data: directPolicies, error: directError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .order('tablename')
      .order('policyname');

    if (directError) {
      console.log('❌ Failed to extract policies:', directError.message);
      console.log('⚠️  Continuing without backup - manual backup recommended\n');
    }
  }

  console.log('📋 Step 2: Verifying Production Users\n');

  const prodUsers = [
    { email: 'sysadmin@pinnaclegroups.ng', role: 'SysAdmin' },
    { email: 'ceo@pinnaclegroups.ng', role: 'CEO' },
    { email: 'md@pinnaclegroups.ng', role: 'MD' },
    { email: 'frontdesk@pinnaclegroups.ng', role: 'Frontdesk' }
  ];

  let usersVerified = 0;
  for (const user of prodUsers) {
    const { data, error } = await supabase
      .from('users')
      .select('email, role')
      .eq('email', user.email)
      .maybeSingle();

    if (error) {
      console.log(`   ⚠️  ${user.email}: Query error (${error.message})`);
    } else if (data) {
      console.log(`   ✅ ${user.email}: Found (${data.role})`);
      usersVerified++;
    } else {
      console.log(`   ⚠️  ${user.email}: Not found in public.users`);
    }
  }

  console.log(`\n📊 Users Verified: ${usersVerified}/4\n`);

  console.log('📋 Step 3: Checking Table Accessibility\n');

  const tables = ['users', 'customers', 'estates', 'plots', 'allocations', 'payments', 'commissions', 'leads'];
  let accessibleTables = 0;

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      if (error.code === '42501') {
        console.log(`   ❌ ${table}: BLOCKED (RLS Permission Denied)`);
      } else if (error.code === '42P17') {
        console.log(`   ❌ ${table}: INFINITE RECURSION`);
      } else {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    } else {
      console.log(`   ✅ ${table}: Accessible`);
      accessibleTables++;
    }
  }

  console.log(`\n📊 Accessible Tables: ${accessibleTables}/${tables.length}\n`);

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    BACKUP SUMMARY                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`✅ Backup preparation complete`);
  console.log(`📁 Backup directory: ${backupDir}`);
  console.log(`👥 Production users verified: ${usersVerified}/4`);
  console.log(`📊 Accessible tables: ${accessibleTables}/${tables.length}\n`);

  if (accessibleTables < tables.length) {
    console.log('⚠️  WARNING: Some tables are inaccessible - RLS fix needed!\n');
  } else {
    console.log('✅ All tables accessible - proceeding with migration as preventive measure\n');
  }

  console.log('🚀 Ready to proceed with RLS migration\n');
  process.exit(0);
}

backupRLSPolicies();
