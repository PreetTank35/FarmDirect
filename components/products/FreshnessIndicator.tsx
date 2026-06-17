"use client";

import styles from "./freshnessIndicator.module.css";

interface FreshnessIndicatorProps {
  harvestDate?: string | null;
  expirationDate?: string | null;
  size?: "sm" | "md" | "lg";
}

export default function FreshnessIndicator({
  harvestDate,
  expirationDate,
  size = "md",
}: FreshnessIndicatorProps) {
  if (!harvestDate && !expirationDate) return null;

  const now = new Date();
  const harvest = harvestDate ? new Date(harvestDate) : null;
  const expiry = expirationDate ? new Date(expirationDate) : null;

  // Check expiration urgency first
  if (expiry) {
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) {
      return (
        <div className={`${styles.badge} ${styles.expired} ${styles[size]}`}>
          <span className={styles.dot}></span>
          Expired
        </div>
      );
    }
    if (daysUntilExpiry <= 3) {
      return (
        <div className={`${styles.badge} ${styles.expiringSoon} ${styles[size]}`}>
          <span className={`${styles.dot} ${styles.pulse}`}></span>
          Expiring Soon — {daysUntilExpiry}d left
        </div>
      );
    }
  }

  // Check harvest freshness
  if (harvest) {
    const daysSinceHarvest = Math.floor(
      (now.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceHarvest <= 7) {
      return (
        <div className={`${styles.badge} ${styles.fresh} ${styles[size]}`}>
          <span className={styles.dot}></span>
          Fresh — Harvested {daysSinceHarvest === 0 ? "today" : `${daysSinceHarvest}d ago`}
        </div>
      );
    }
    if (daysSinceHarvest <= 30) {
      return (
        <div className={`${styles.badge} ${styles.good} ${styles[size]}`}>
          <span className={styles.dot}></span>
          Good — Harvested {daysSinceHarvest}d ago
        </div>
      );
    }
    if (daysSinceHarvest <= 60) {
      return (
        <div className={`${styles.badge} ${styles.fair} ${styles[size]}`}>
          <span className={styles.dot}></span>
          Fair — Harvested {daysSinceHarvest}d ago
        </div>
      );
    }
    return (
      <div className={`${styles.badge} ${styles.aged} ${styles[size]}`}>
        <span className={styles.dot}></span>
        Stored — {daysSinceHarvest}d since harvest
      </div>
    );
  }

  return null;
}
