import React from "react";
import styles from "./Categories.module.css";

const CATEGORIES = [
  {
    name: "Fresh Produce",
    emoji: "🥬",
    tagline: "Organic vegetables straight from local farms, harvested daily",
    count: "2,400+ products",
    color: "green",
  },
  {
    name: "Fruits & Berries",
    emoji: "🍎",
    tagline: "Seasonal fruits, mangoes, berries — vine-ripened, never cold-stored",
    count: "1,800+ products",
    color: "amber",
  },
  {
    name: "Dairy & Eggs",
    emoji: "🥛",
    tagline: "Farm-fresh milk, paneer, ghee, and free-range eggs delivered chilled",
    count: "960+ products",
    color: "blue",
  },
  {
    name: "Grains & Pulses",
    emoji: "🌾",
    tagline: "Single-origin rice, wheat, millets, and heritage lentils",
    count: "1,200+ products",
    color: "earth",
  },
  {
    name: "Handmade & Artisan",
    emoji: "🏺",
    tagline: "Pickles, honey, jaggery, and handcrafted goods from rural artisans",
    count: "3,100+ products",
    color: "rose",
  },
  {
    name: "Spices & Herbs",
    emoji: "🌶️",
    tagline: "Single-estate turmeric, cardamom, saffron, and garden-fresh herbs",
    count: "840+ products",
    color: "purple",
  },
];

export default function Categories() {
  return (
    <section className={`section ${styles.section}`} id="categories">
      <div className="container">
        <div className="section-header">
          <span className="section-label">🛍️ Browse Categories</span>
          <h2>Everything From the Source</h2>
          <p>
            Six categories of farm-fresh and artisan products — all
            blockchain-verified, all shipped directly from the producer.
          </p>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className={`${styles.card} ${styles[cat.color]}`}
              role="button"
              tabIndex={0}
            >
              <div className={styles.icon}>{cat.emoji}</div>
              <span className={styles.name}>{cat.name}</span>
              <p className={styles.tagline}>{cat.tagline}</p>
              <div className={styles.cardBottom}>
                <span className={styles.count}>{cat.count}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
