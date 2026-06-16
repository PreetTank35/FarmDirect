import React from "react";
import styles from "./TrustSection.module.css";

const FEATURES = [
  {
    icon: "🔗",
    title: "Blockchain Verified Origin",
    description:
      "Every product is traced from producer to doorstep. Scan a QR code to reveal the full journey — recorded on an immutable ledger that nobody can tamper with.",
    color: "featureGreen",
  },
  {
    icon: "🔐",
    title: "Smart Contract Escrow",
    description:
      "Payments are locked in code, not held by us. Funds auto-release only after you confirm delivery. No disputes, no delays — just trustless transactions.",
    color: "featureAmber",
  },
  {
    icon: "🤖",
    title: "AI-Powered Discovery",
    description:
      "Our recommendation engine learns your tastes and surfaces products from producers you'd never find otherwise. Smarter search, better matches, zero noise.",
    color: "featureBlue",
  },
];

export default function TrustSection() {
  return (
    <section className={`section ${styles.section}`} id="trust">
      <div className={`container ${styles.inner}`}>
        {/* Visual Side */}
        <div className={styles.visual}>
          <div className={styles.visualBg} aria-hidden="true" />
          <div className={`${styles.trustIcon} ${styles.trustIcon1}`} aria-hidden="true">🔗</div>
          <div className={`${styles.trustIcon} ${styles.trustIcon2}`} aria-hidden="true">🛡️</div>
          <div className={`${styles.trustIcon} ${styles.trustIcon3}`} aria-hidden="true">📊</div>
          <div className={`${styles.trustIcon} ${styles.trustIcon4}`} aria-hidden="true">🤖</div>
          <div className={`${styles.trustIcon} ${styles.trustIcon5}`} aria-hidden="true">✓</div>
        </div>

        {/* Content Side */}
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <span className="section-label">🛡️ Built on Trust</span>
            <h2>Technology That Works for You</h2>
            <p>
              We combine blockchain transparency, smart contract security, and
              AI intelligence — so you can shop with confidence and producers
              get paid fairly.
            </p>
          </div>

          <div className={styles.features}>
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`${styles.feature} ${styles[feature.color]}`}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
