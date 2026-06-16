import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const role = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // If a role was passed (e.g., from Google OAuth signup), update the user's role
      if (role === "vendor" || role === "customer") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile && profile.role !== role) {
          // Update profile role
          await supabase.from("profiles").update({ role }).eq("id", data.user.id);

          // If upgrading to vendor, ensure a vendor profile exists
          if (role === "vendor") {
            const { data: vp } = await supabase
              .from("vendor_profiles")
              .select("id")
              .eq("user_id", data.user.id)
              .single();

            if (!vp) {
              await supabase.from("vendor_profiles").insert({
                user_id: data.user.id,
                business_name: data.user.user_metadata?.full_name || "My Business",
                business_type: "farmer",
              });
            }
          }
        }
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth code exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
