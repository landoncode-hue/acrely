import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Test with anon key (what the app uses)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Test with service key (admin access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAccess() {
  console.log('\n🔍 Checking profile access...\n');

  // Check with service key (should work)
  console.log('1️⃣ Testing with SERVICE KEY (admin):');
  const { data: adminProfiles, error: adminError } = await supabaseAdmin
    .from('profiles')
    .select('*');
  
  if (adminError) {
    console.error('❌ Admin access failed:', adminError.message);
  } else {
    console.log(`✅ Found ${adminProfiles?.length || 0} profiles with admin access`);
    adminProfiles?.forEach(p => console.log(`   - ${p.email} (${p.role})`));
  }

  // Check with anon key (what users use)
  console.log('\n2️⃣ Testing with ANON KEY (public/unauthenticated):');
  const { data: anonProfiles, error: anonError } = await supabaseAnon
    .from('profiles')
    .select('*');
  
  if (anonError) {
    console.log('⚠️  Anon access blocked (expected):', anonError.message);
  } else {
    console.log(`✅ Anon can see ${anonProfiles?.length || 0} profiles`);
  }

  // Test authenticated access
  console.log('\n3️⃣ Testing AUTHENTICATED user access:');
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authData && authData.users.length > 0) {
    const testUser = authData.users[0];
    console.log(`Testing with user: ${testUser.email}`);
    
    // Try to query their own profile
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();
    
    if (userError) {
      console.error('❌ Cannot fetch user profile:', userError.message);
    } else {
      console.log('✅ Profile found:', userProfile);
    }
  }

  console.log('\n4️⃣ Checking RLS policies:');
  const { data: policies, error: policyError } = await supabaseAdmin
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'profiles');
  
  if (policyError) {
    console.log('⚠️  Cannot query policies:', policyError.message);
  } else if (policies && policies.length > 0) {
    console.log(`✅ Found ${policies.length} RLS policies:`);
    policies.forEach(p => console.log(`   - ${p.policyname}`));
  } else {
    console.log('⚠️  No RLS policies found! This might be the issue.');
  }

  console.log('\n');
}

checkAccess();
