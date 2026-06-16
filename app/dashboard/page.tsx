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

        <div className={styles.dashboardGrid}>
          {role === "vendor" ? (
            <>
              <div className={styles.card}>
                <h3>Sell a Product</h3>
                <p>List a new product on the blockchain marketplace.</p>
                <Link href="/dashboard/products/new" className={styles.quickLink}>
                  Add New Product →
                </Link>
              </div>
              <div className={styles.card}>
                <h3>Your Sales</h3>
                <p>View and manage orders placed by customers.</p>
                <Link href="/dashboard/orders" className={styles.quickLink}>
                  View Orders →
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.card}>
                <h3>My Purchases</h3>
                <p>Track the status of your marketplace orders.</p>
                <Link href="/dashboard/orders" className={styles.quickLink}>
                  View Orders →
                </Link>
              </div>
            </>
          )}

          <div className={styles.card}>
            <h3>Marketplace</h3>
            <p>Browse products listed by farmers across the network.</p>
            <Link href="/products" className={styles.quickLink}>
              Browse Marketplace →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
