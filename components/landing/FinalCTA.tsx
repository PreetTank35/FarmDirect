"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./FinalCTA.module.css";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
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

  const handleBecomeSeller = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/register?role=vendor");
    }
  };

  return (
    <section className={`${styles.section}`} id="final-cta">
      {/* Animated blobs */}
      <div className={styles.bgBlobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      <div className={`container ${styles.inner}`}>
        <span className={styles.label}>🚀 Get Started</span>

        <h2 className={styles.title}>
          Ready to Join the{" "}
          <span className={styles.titleAccent}>Farm-to-Door</span> Revolution?
        </h2>

        <p className={styles.subtitle}>
          Whether you&apos;re a farmer looking to sell directly, or a shopper
          seeking authentic, traceable products — FarmDirect is your
          marketplace. No middlemen. No mystery. Just honest commerce.
        </p>

        <div className={styles.actions}>
          <Button variant="primary" size="xl" onClick={handleStartShopping} id="final-cta-shopping-btn">
            Start Shopping
          </Button>
          <button className={styles.outlineWhite} onClick={handleBecomeSeller} id="final-cta-seller-btn">
            Become a Seller
          </button>
        </div>

        <p className={styles.trust}>
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          No credit card required. Free to join. Blockchain-secured.
        </p>
      </div>
    </section>
  );
}
