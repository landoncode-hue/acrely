import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    email: 'sysadmin@pinnaclegroups.ng',
    password: 'SysAdminPinnacle2025!',
    name: 'System Administrator',
    role: 'SysAdmin',
    phone: '+2348000000001'
  },
  {
    email: 'ceo@pinnaclegroups.ng',
    password: 'CeoPinnacle2025!',
    name: 'Chief Executive Officer',
    role: 'CEO',
    phone: '+2348000000002'
  },
  {
    email: 'md@pinnaclegroups.ng',
    password: 'MdPinnacle2025!',
    name: 'Managing Director',
    role: 'MD',
    phone: '+2348000000003'
  },
  {
    email: 'frontdesk@pinnaclegroups.ng',
    password: 'FrontDeskPinnacle2025!',
    name: 'Front Desk Staff',
    role: 'Frontdesk',
    phone: '+2348000000004'
  }
];

async function seedUsers() {
  console.log('\n🌱 Seeding users to Supabase...\n');

  for (const user of users) {
    try {
      console.log(`⏳ Creating ${user.role}: ${user.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User already exists: ${user.email}`);
          continue;
        }
        console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${user.email}`);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.name,
          phone: user.phone,
          role: user.role,
          avatar_url: null,
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Profile created: ${user.name} (${user.role})`);
      console.log('');

    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('🎉 User seeding complete!\n');
  console.log('📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  users.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Name:     ${user.name}`);
  });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ You can now log in at: http://localhost:3000/login\n');
}

seedUsers();
