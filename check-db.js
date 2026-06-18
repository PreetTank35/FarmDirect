require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

supabase.from("vendor_profiles").select("business_name, custodial_wallet_address, user_id").then(res => {
  console.log("Vendor Profiles:");
  console.log(res.data);
}).catch(console.error);

supabase.from("products").select("title, vendor_id").then(res => {
  console.log("\nProducts:");
  console.log(res.data);
}).catch(console.error);
