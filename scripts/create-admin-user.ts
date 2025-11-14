import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  console.log('\n🔐 Create Admin User for Acrely\n');
  console.log('This script will create a new admin user in your Supabase database.\n');

  try {
    const email = await question('Enter email address: ');
    const password = await question('Enter password (min 6 characters): ');
    const fullName = await question('Enter full name: ');
    const phone = await question('Enter phone number (e.g., +2348012345678): ');
    
    console.log('\nSelect role:');
    console.log('1. SysAdmin (Full system access)');
    console.log('2. CEO (Executive dashboard)');
    console.log('3. MD (Managing Director)');
    console.log('4. Frontdesk (Limited access)');
    console.log('5. Agent (Field staff)\n');
    
    const roleChoice = await question('Enter role number (1-5): ');
    
    const roles = ['SysAdmin', 'CEO', 'MD', 'Frontdesk', 'Agent'];
    const role = roles[parseInt(roleChoice) - 1];
    
    if (!role) {
      console.error('❌ Invalid role selection');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating user...');

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      rl.close();
      return;
    }

    console.log('✅ Auth user created');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        role,
        avatar_url: null,
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      rl.close();
      return;
    }

    console.log('✅ Profile created');
    console.log('\n🎉 Success! User created with the following details:\n');
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Name: ${fullName}`);
    console.log(`Phone: ${phone}`);
    console.log('\n✨ You can now log in at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

createAdminUser();
