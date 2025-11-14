import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUsers() {
  console.log('\n🔍 Checking Supabase users...\n');

  try {
    // Check auth users
    console.log('📋 Auth Users:');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`Found ${authData.users.length} users in auth.users`);
    authData.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
    });

    // Check profiles
    console.log('\n📋 Profiles:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
      console.log('\n⚠️  The profiles table might not exist yet.');
      console.log('Run this SQL in Supabase SQL Editor to create it:\n');
      console.log('CREATE TABLE IF NOT EXISTS public.profiles (');
      console.log('  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  email TEXT,');
      console.log('  full_name TEXT,');
      console.log('  phone TEXT,');
      console.log('  role TEXT NOT NULL DEFAULT \'Agent\',');
      console.log('  avatar_url TEXT,');
      console.log('  created_at TIMESTAMPTZ DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMPTZ DEFAULT NOW()');
      console.log(');\n');
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log(`Found ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} | ${profile.full_name} | Role: ${profile.role}`);
      });
    } else {
      console.log('⚠️  No profiles found.');
      console.log('\nAuth users exist but profiles are missing.');
      console.log('You need to add profiles for these users.\n');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUsers();
