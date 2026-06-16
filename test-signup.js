const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const testId = '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabase.from('profiles').insert({
    id: testId,
    full_name: 'Test Profile',
    role: 'customer'
  });
  
  if (error) {
    console.error("PROFILES INSERT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("PROFILES INSERT SUCCESS");
    
    // Clean up
    await supabase.from('profiles').delete().eq('id', testId);
  }
}

testInsert();
