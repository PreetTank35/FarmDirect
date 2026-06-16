"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./Hero.module.css";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function Hero() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, [supabase]);

  const handleStartShopping = () => {
    if (user) {
      router.push("/products");
    } else {
      router.push("/register?role=customer");
    }
  };

  const handleStartSelling = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/register?role=vendor");
    }
  };
  return (
    <section className={styles.hero} id="hero">
      {/* Animated background blobs */}
      <div className={styles.bgBlobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      {/* Grain texture overlay */}
      <div className={styles.grain} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <Badge variant="primary" size="md" dot>
            Powered by Blockchain & AI
          </Badge>

          <h1 className={styles.title}>
            From the <span className={styles.highlight}>Farm</span> to
            <br />
            Your Door.{" "}
            <span className={styles.titleAccent}>Zero Middlemen.</span>
          </h1>

          <p className={styles.subtitle}>
            Buy directly from farmers and manufacturers with blockchain-verified
            origin tracking, smart contract escrow payments, and AI-powered
            product discovery. Every product has a story — now you can trace it.
          </p>

          <div className={styles.actions}>
            <Button variant="primary" size="xl" onClick={handleStartShopping} id="hero-start-shopping-btn">
              Start Shopping
            </Button>
            <Button variant="outline" size="xl" onClick={handleStartSelling} id="hero-sell-products-btn">
              Sell Your Products
            </Button>
          </div>

          {/* Trust badges */}
          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Smart Contract Escrow</span>
            </div>
            <div className={styles.trustItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>Real-Time Tracking</span>
            </div>
            <div className={styles.trustItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>Verified Quality</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className={styles.visual}>
          <div className={styles.visualCard}>
            <div className={styles.productPreview}>
              <div className={styles.productImage}>
                <span className={styles.productEmoji}>🥭</span>
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productFarm}>Ratnagiri Orchards</span>
                <span className={styles.productName}>Organic Alphonso Mangoes</span>
                <span className={styles.productPrice}>₹499 / dozen</span>
              </div>
              <div className={styles.productBadges}>
                <span className={styles.verifiedBadge}>✓ Blockchain Verified</span>
                <span className={styles.originBadge}>📍 Ratnagiri, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className={`${styles.floater} ${styles.floater1}`}>
            <span>🌾</span>
            <div>
              <strong>12,000+</strong>
              <small>Farmers Onboard</small>
            </div>
          </div>
          <div className={`${styles.floater} ${styles.floater2}`}>
            <span>🔐</span>
            <div>
              <strong>₹2.4Cr</strong>
              <small>Secured in Escrow</small>
            </div>
          </div>
          <div className={`${styles.floater} ${styles.floater3}`}>
            <span>⭐</span>
            <div>
              <strong>4.9/5</strong>
              <small>Trust Rating</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
