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

const userEmails = [
  { email: 'sysadmin@pinnaclegroups.ng', name: 'System Administrator', role: 'SysAdmin', phone: '+2348000000001' },
  { email: 'ceo@pinnaclegroups.ng', name: 'Chief Executive Officer', role: 'CEO', phone: '+2348000000002' },
  { email: 'md@pinnaclegroups.ng', name: 'Managing Director', role: 'MD', phone: '+2348000000003' },
  { email: 'frontdesk@pinnaclegroups.ng', name: 'Front Desk Staff', role: 'Frontdesk', phone: '+2348000000004' }
];

async function addProfiles() {
  console.log('\n📝 Adding user profiles...\n');

  for (const user of userEmails) {
    try {
      // Get user ID from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Error fetching users:', authError.message);
        continue;
      }

      const authUser = authUsers.users.find(u => u.email === user.email);
      
      if (!authUser) {
        console.log(`⚠️  User not found: ${user.email}`);
        continue;
      }

      console.log(`⏳ Adding profile for ${user.email}`);

      // Insert or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          user_id: authUser.id,
          email: user.email,
          full_name: user.name,
          phone: user.phone,
          role: user.role,
          avatar_url: null,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ Error for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Profile added: ${user.name} (${user.role})`);

    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('\n🎉 Profiles added successfully!\n');
}

addProfiles();
