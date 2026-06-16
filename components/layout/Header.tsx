"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import Button from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Marketplace", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Sellers", href: "#for-sellers" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} id="site-header">
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="FarmDirect Home">
            <span className={styles.logoIcon}>🌱</span>
            <span className={styles.logoText}>
              Farm<span className={styles.logoAccent}>Direct</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav} aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className={styles.actions}>
            <Link href="/login">
              <Button variant="ghost" size="sm" id="header-login-btn">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" id="header-register-btn">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            id="mobile-menu-toggle"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <nav
            className={styles.mobileNav}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation"
          >
            <div className={styles.mobileNavHeader}>
              <span className={styles.logoIcon}>🌱</span>
              <span className={styles.logoText}>
                Farm<span className={styles.logoAccent}>Direct</span>
              </span>
              <button
                className={styles.mobileClose}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileActions}>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="lg" fullWidth id="mobile-login-btn">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="lg" fullWidth id="mobile-register-btn">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
