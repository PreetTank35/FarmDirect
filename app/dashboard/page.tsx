import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "customer";
  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span>🌱</span>
          <span>Farm<span className={styles.accent}>Direct</span></span>
        </Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signOutBtn} id="dashboard-signout-btn">
            Sign Out
          </button>
        </form>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <div className={styles.avatar}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome back, {firstName}! 👋</h1>
            <p className={styles.welcomeSub}>
              You&apos;re signed in as a{" "}
              <span className={styles.roleBadge}>
                {role === "vendor" ? "🌾 Seller" : role === "admin" ? "⚙️ Admin" : "🛒 Shopper"}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>🚧</div>
          <h2>Dashboard Coming Soon</h2>
          <p>
            Your personalized {role === "vendor" ? "seller" : "shopper"} dashboard is being built.
            Phase 3 (Marketplace) and beyond will unlock your full dashboard experience.
          </p>
          <div className={styles.quickLinks}>
            <Link href="/" className={styles.quickLink}>
              ← Back to Home
            </Link>
            <Link href="/products" className={styles.quickLink}>
              Browse Products →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
