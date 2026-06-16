const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      vendor_profiles ( business_name, description, location ),
      reviews (
        id, rating, comment, created_at, profiles ( full_name )
      )
    `)
    .eq("id", "58255041-7360-442b-8a91-09a107196314")
    .single();
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
checkProducts();
