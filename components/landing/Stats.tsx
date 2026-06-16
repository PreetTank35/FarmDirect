"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Stats.module.css";

interface StatData {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatData[] = [
  { icon: "🌾", value: 12000, suffix: "+", label: "Active Farmers" },
  { icon: "📦", value: 48000, suffix: "+", label: "Products Listed" },
  { icon: "🚚", value: 250000, suffix: "+", label: "Orders Fulfilled" },
  { icon: "⭐", value: 4.9, suffix: "/5", label: "Trust Score" },
];

function formatNumber(value: number): string {
  if (value < 1000) {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }
  if (value >= 100000) {
    const thousands = Math.round(value / 1000);
    return thousands.toLocaleString("en-US") + "K";
  }
  return value.toLocaleString("en-IN");
}

function AnimatedStat({ stat }: { stat: StatData }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const isDecimal = stat.value % 1 !== 0;

          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * stat.value;
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div className={styles.stat} ref={ref}>
      <div className={styles.statIcon}>{stat.icon}</div>
      <span className={styles.statValue}>
        {formatNumber(count)}
        {stat.suffix}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
    </div>
  );
}

export default function Stats() {
  return (
    <section className={`section ${styles.section}`} id="stats">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>📊 By the Numbers</span>
          <h2>Trusted by Thousands</h2>
          <p>
            Real numbers from a growing community of producers and shoppers
            building fairer commerce together.
          </p>
        </div>

        <div className={styles.grid}>
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
