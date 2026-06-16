import React from "react";
import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    text: "I sell my organic jams directly to customers across India. No middleman taking 40% anymore. My income has grown three-fold since joining FarmDirect.",
    name: "Priya Sharma",
    role: "Producer — Himachal Pradesh",
    emoji: "👩‍🌾",
    avatarColor: "avatarGreen",
  },
  {
    text: "The blockchain verification gives me complete confidence in what I'm buying. I scanned my mangoes and traced them back to the exact orchard in Ratnagiri. That's transparency.",
    name: "Arjun Patel",
    role: "Customer — Mumbai",
    emoji: "👨‍💻",
    avatarColor: "avatarAmber",
  },
  {
    text: "Since joining FarmDirect, my income has doubled. The AI descriptions help my products reach people who actually want them. I never thought technology could help a small farmer like me.",
    name: "Lakshmi Devi",
    role: "Farmer — Karnataka",
    emoji: "👩‍🌾",
    avatarColor: "avatarBlue",
  },
];

export default function Testimonials() {
  return (
    <section className={`section ${styles.section}`} id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-label">💬 What People Say</span>
          <h2>Stories From Our Community</h2>
          <p>
            Real voices from farmers, artisans, and shoppers who are part of
            the FarmDirect revolution.
          </p>
        </div>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.card}>
              <div className={styles.quote} aria-hidden="true">
                &ldquo;
              </div>
              <div className={styles.stars} aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={styles.star}>
                    ★
                  </span>
                ))}
              </div>
              <p className={styles.text}>{t.text}</p>
              <div className={styles.author}>
                <div className={`${styles.avatar} ${styles[t.avatarColor]}`}>
                  {t.emoji}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{t.name}</span>
                  <span className={styles.authorRole}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
