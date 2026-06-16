import React from "react";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    number: "01",
    icon: "📦",
    title: "Producers List Products",
    description:
      "Farmers and manufacturers upload their products with AI-assisted descriptions. Origin data is automatically recorded on the blockchain for permanent traceability.",
    detail: "AI generates descriptions • IPFS stores certificates • Blockchain logs origin",
    color: "green",
  },
  {
    number: "02",
    icon: "🛒",
    title: "Shoppers Buy Directly",
    description:
      "Browse, search, and purchase using standard payment methods. Your payment is secured in a smart contract escrow — not held by us, but by code.",
    detail: "UPI & cards accepted • Smart contract escrow • Zero platform custody",
    color: "amber",
  },
  {
    number: "03",
    icon: "✅",
    title: "Verify & Receive",
    description:
      "Scan the QR code to trace the product's journey from farm to your door. Confirm delivery and the escrow instantly releases payment to the producer.",
    detail: "QR origin scanner • Auto-release payment • Rate & review on-chain",
    color: "blue",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-label">✨ How It Works</span>
          <h2>Three Steps to Trustworthy Commerce</h2>
          <p>
            No crypto knowledge required. No complicated wallets. Just
            transparent, fair trade powered by technology that works invisibly
            behind the scenes.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className={`${styles.step} ${styles[step.color]}`}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
                <div className={styles.stepDetail}>{step.detail}</div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <svg
                    width="48"
                    height="24"
                    viewBox="0 0 48 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12H44M44 12L34 2M44 12L34 22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
