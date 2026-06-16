import React from "react";
import styles from "./ForSellers.module.css";
import Button from "@/components/ui/Button";

const BENEFITS = [
  {
    icon: "✓",
    title: "Zero Listing Fees",
    description:
      "List as many products as you want for free. We only charge a small 3% fee when you actually make a sale.",
  },
  {
    icon: "✓",
    title: "Direct Payments via Smart Contract",
    description:
      "Get paid directly — no payment delays, no middleman holdbacks. Funds release automatically upon delivery confirmation.",
  },
  {
    icon: "✓",
    title: "AI-Powered Listings",
    description:
      "Auto-generate compelling product descriptions, optimise pricing with market data, and get SEO-ready listings in seconds.",
  },
  {
    icon: "✓",
    title: "Real-Time Analytics Dashboard",
    description:
      "Track sales, reviews, trends, and customer behaviour in real-time. Know what sells and when to stock up.",
  },
];

const CHART_HEIGHTS = [35, 55, 42, 68, 80, 62, 90, 75, 95, 60, 82, 70];

const ORDERS = [
  { product: "Organic Honey — 500g", status: "Delivered", statusClass: "statusDelivered" },
  { product: "Alphonso Mangoes — 1 doz", status: "Shipped", statusClass: "statusShipped" },
  { product: "Cold-Press Mustard Oil", status: "New", statusClass: "statusNew" },
];

export default function ForSellers() {
  return (
    <section className={`section ${styles.section}`} id="for-sellers">
      <div className={`container ${styles.inner}`}>
        {/* Benefits Side */}
        <div className={styles.benefits}>
          <div className={styles.benefitsHeader}>
            <span className="section-label">🌾 For Producers</span>
            <h2>Sell Directly. Earn More.</h2>
            <p>
              Whether you grow it, make it, or craft it — FarmDirect puts you
              in front of customers who care about quality and origin.
            </p>
          </div>

          <div className={styles.benefitList}>
            {BENEFITS.map((b) => (
              <div key={b.title} className={styles.benefit}>
                <div className={styles.benefitCheck}>{b.icon}</div>
                <div className={styles.benefitText}>
                  <span className={styles.benefitTitle}>{b.title}</span>
                  <p className={styles.benefitDesc}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cta}>
            <Button variant="primary" size="lg">
              Start Selling Today →
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup Side */}
        <div className={styles.dashboard}>
          {/* Title Bar */}
          <div className={styles.dashboardBar}>
            <span className={styles.dashboardDot} />
            <span className={styles.dashboardDot} />
            <span className={styles.dashboardDot} />
            <span className={styles.dashboardTitle}>
              FarmDirect — Seller Dashboard
            </span>
          </div>

          <div className={styles.dashboardBody}>
            {/* Stat Row */}
            <div className={styles.dashRow}>
              <div className={styles.dashCard}>
                <span className={styles.dashCardLabel}>Revenue</span>
                <span className={styles.dashCardValue}>₹1.8L</span>
                <span className={`${styles.dashCardTrend} ${styles.trendUp}`}>
                  ↑ 24%
                </span>
              </div>
              <div className={styles.dashCard}>
                <span className={styles.dashCardLabel}>Orders</span>
                <span className={styles.dashCardValue}>342</span>
                <span className={`${styles.dashCardTrend} ${styles.trendUp}`}>
                  ↑ 18%
                </span>
              </div>
              <div className={styles.dashCard}>
                <span className={styles.dashCardLabel}>Rating</span>
                <span className={styles.dashCardValue}>4.9</span>
                <span className={`${styles.dashCardTrend} ${styles.trendUp}`}>
                  ↑ 0.2
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className={styles.dashChart}>
              {CHART_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={styles.chartBar}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Recent Orders */}
            <div className={styles.dashOrders}>
              <span className={styles.dashOrdersTitle}>Recent Orders</span>
              {ORDERS.map((order) => (
                <div key={order.product} className={styles.dashOrder}>
                  <span className={styles.orderProduct}>{order.product}</span>
                  <span
                    className={`${styles.orderStatus} ${styles[order.statusClass]}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
