const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateUser() {
  const email = `admin_test_${Date.now()}@example.com`;
  console.log("Admin testing signup for:", email);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: 'Password123!',
    email_confirm: false,
    user_metadata: {
      full_name: 'Admin Test Seller',
      role: 'vendor'
    }
  });

  if (error) {
    console.error("ADMIN SIGNUP ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("ADMIN SIGNUP SUCCESS:", data.user?.id);
  }
}

testCreateUser();
