const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProducts() {
  const { data, error } = await supabase
    .from("products")
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
checkProducts();
