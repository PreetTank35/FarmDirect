"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  const next = searchParams.get("next") || "/dashboard";
  const errorParam = searchParams.get("error");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast({ type: "error", title: "Login failed", message: error.message });
      setLoading(false);
    } else {
      showToast({ type: "success", title: "Welcome back!", message: "Redirecting to your dashboard…" });
      router.push(next);
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      showToast({ type: "warning", title: "Enter your email", message: "We'll send you a magic link to sign in." });
      return;
    }
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    setMagicLoading(false);
    if (error) {
      showToast({ type: "error", title: "Error", message: error.message });
    } else {
      showToast({ type: "success", title: "Magic link sent!", message: "Check your email inbox." });
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    if (error) {
      showToast({ type: "error", title: "Google sign-in failed", message: error.message });
      setGoogleLoading(false);
    }
  }

  return (
    <div className={styles.formCard}>
      {/* Error Banner */}
      {errorParam && (
        <div className={styles.errorBanner} role="alert">
          ⚠ Authentication failed. Please try again.
        </div>
      )}

      {/* Google OAuth */}
      <Button
        id="login-google-btn"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleGoogleLogin}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <span className={styles.spinner} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
        )}
        Continue with Google
      </Button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      {/* Mode Toggle */}
      <div className={styles.modeToggle} role="group" aria-label="Sign-in method">
        <button
          className={`${styles.modeBtn} ${mode === "password" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("password")}
          type="button"
          id="mode-password"
        >
          🔑 Password
        </button>
        <button
          className={`${styles.modeBtn} ${mode === "magic" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("magic")}
          type="button"
          id="mode-magic"
        >
          ✨ Magic Link
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handleEmailLogin} className={styles.form} noValidate>
          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            leftIcon={<span>✉</span>}
          />
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
            leftIcon={<span>🔒</span>}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            }
          />
          <div className={styles.forgotRow}>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <Button
            id="login-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading || !email || !password}
          >
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className={styles.form} noValidate>
          <Input
            id="login-magic-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            leftIcon={<span>✉</span>}
            hint="We'll send you a secure, one-time login link."
          />
          <Button
            id="magic-link-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={magicLoading || !email}
          >
            {magicLoading ? <span className={styles.spinner} /> : "✨"}
            {magicLoading ? "Sending…" : "Send Magic Link"}
          </Button>
        </form>
      )}

      <p className={styles.registerPrompt}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={styles.registerLink}>
          Create one free →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Left panel — branding */}
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌱</span>
          <span className={styles.logoText}>
            Farm<span className={styles.logoAccent}>Direct</span>
          </span>
        </Link>
        <div className={styles.leftContent}>
          <h1 className={styles.headline}>
            Fresh from farm.<br />
            <span className={styles.gradientText}>Straight to you.</span>
          </h1>
          <p className={styles.subtext}>
            Join 50,000+ shoppers getting fresh produce directly from verified farmers and makers — no middlemen, no markups.
          </p>
          <div className={styles.features}>
            {[
              { icon: "🔗", label: "Blockchain-verified origin" },
              { icon: "🔒", label: "Smart contract escrow" },
              { icon: "🤖", label: "AI-powered discovery" },
              { icon: "🌾", label: "100% direct from source" },
            ].map((f) => (
              <div key={f.label} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.testimonial}>
          <p className={styles.testimonialText}>
            &ldquo;I saved ₹3,200 last month buying directly from farmers. The mangoes were phenomenal!&rdquo;
          </p>
          <div className={styles.testimonialAuthor}>
            <div className={styles.testimonialAvatar}>P</div>
            <div>
              <p className={styles.authorName}>Priya Sharma</p>
              <p className={styles.authorRole}>Customer, Pune</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.rightInner}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your FarmDirect account</p>
          </div>
          <Suspense fallback={<div className={styles.formCard} />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
