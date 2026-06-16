"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./register.module.css";

type Role = "customer" | "vendor";

const ROLE_OPTIONS: { value: Role; icon: string; label: string; description: string }[] = [
  {
    value: "customer",
    icon: "🛒",
    label: "I'm a Shopper",
    description: "Browse and buy fresh produce, handcrafted goods, and more directly from verified farmers and makers.",
  },
  {
    value: "vendor",
    icon: "🌾",
    label: "I'm a Seller",
    description: "List your farm produce or manufactured goods, reach thousands of direct buyers, get paid instantly.",
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const supabase = createClient();

  const roleParam = searchParams.get("role");
  const initialRole = roleParam === "vendor" ? "vendor" : "customer";

  const [step, setStep] = useState<1 | 2>(roleParam ? 2 : 1);
  const [role, setRole] = useState<Role>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const passwordStrong = password.length >= 8;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) {
      showToast({ type: "error", title: "Passwords don't match", message: "Please make sure both passwords are the same." });
      return;
    }
    if (!passwordStrong) {
      showToast({ type: "warning", title: "Weak password", message: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);

    if (error) {
      showToast({ type: "error", title: "Registration failed", message: error.message });
    } else {
      showToast({
        type: "success",
        title: "Account created! 🎉",
        message: "Check your email to verify your account.",
        duration: 6000,
      });
      router.push("/login?registered=true");
    }
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&role=${role}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      showToast({ type: "error", title: "Google sign-up failed", message: error.message });
      setGoogleLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌱</span>
          <span className={styles.logoText}>
            Farm<span className={styles.logoAccent}>Direct</span>
          </span>
        </Link>
        <div className={styles.leftContent}>
          <h1 className={styles.headline}>
            Join the farm-to-door<br />
            <span className={styles.gradientText}>revolution.</span>
          </h1>
          <p className={styles.subtext}>
            Whether you&apos;re a farmer wanting fair prices for your harvest, or a family wanting real food without markups — FarmDirect is your platform.
          </p>

          <div className={styles.statsGrid}>
            {[
              { value: "50K+", label: "Happy shoppers" },
              { value: "2K+", label: "Verified farmers" },
              { value: "₹2.4Cr", label: "Paid to farmers" },
              { value: "4.9★", label: "Average rating" },
            ].map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trustBadge}>
          <span>🔒</span>
          <span>Your data is encrypted and never sold. Blockchain-verified transactions.</span>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.rightInner}>
          {/* Step indicator */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}>
              <span className={styles.stepNum}>1</span>
              <span>Choose role</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}>
              <span className={styles.stepNum}>2</span>
              <span>Your details</span>
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {step === 1 ? "How are you joining?" : "Create your account"}
            </h2>
            <p className={styles.formSubtitle}>
              {step === 1
                ? "You can switch roles later in your settings."
                : "Fill in your details to get started."}
            </p>
          </div>

          <div className={styles.formCard}>
            {step === 1 ? (
              <>
                <div className={styles.roleGrid} role="group" aria-label="Account type">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.roleCard} ${role === opt.value ? styles.roleCardActive : ""}`}
                      onClick={() => setRole(opt.value)}
                      type="button"
                      id={`role-${opt.value}`}
                      aria-pressed={role === opt.value}
                    >
                      <span className={styles.roleIcon}>{opt.icon}</span>
                      <span className={styles.roleLabel}>{opt.label}</span>
                      <span className={styles.roleDesc}>{opt.description}</span>
                      {role === opt.value && <span className={styles.roleCheck}>✓</span>}
                    </button>
                  ))}
                </div>
                <Button
                  id="role-next-btn"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setStep(2)}
                >
                  Continue as {role === "customer" ? "Shopper" : "Seller"} →
                </Button>
              </>
            ) : (
              <>
                <Button
                  id="register-google-btn"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={handleGoogleRegister}
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
                  Sign up with Google
                </Button>

                <div className={styles.divider}><span>or</span></div>

                <form onSubmit={handleRegister} className={styles.form} noValidate>
                  <Input
                    id="register-name"
                    label="Full name"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    fullWidth
                    autoComplete="name"
                    leftIcon={<span>👤</span>}
                  />
                  <Input
                    id="register-email"
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
                    id="register-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    autoComplete="new-password"
                    leftIcon={<span>🔒</span>}
                    hint={password && !passwordStrong ? "Must be at least 8 characters" : undefined}
                    error={password && !passwordStrong ? "Password too short" : undefined}
                  />
                  <Input
                    id="register-confirm-password"
                    label="Confirm password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    autoComplete="new-password"
                    leftIcon={<span>🔒</span>}
                    error={confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeBtn}
                        aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    }
                  />

                  {/* Password strength indicator */}
                  {password && (
                    <div className={styles.strengthBar}>
                      <div
                        className={styles.strengthFill}
                        style={{
                          width: password.length >= 12 ? "100%" : password.length >= 8 ? "60%" : "30%",
                          background: password.length >= 12
                            ? "var(--color-success)"
                            : password.length >= 8
                            ? "var(--color-warning)"
                            : "var(--color-error)",
                        }}
                      />
                    </div>
                  )}

                  <p className={styles.terms}>
                    By creating an account you agree to our{" "}
                    <Link href="/terms" className={styles.termsLink}>Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
                  </p>

                  <Button
                    id="register-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={loading || !email || !password || !confirmPassword || !passwordsMatch || !passwordStrong}
                  >
                    {loading && <span className={styles.spinner} />}
                    {loading ? "Creating account…" : "Create Account 🎉"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={styles.backBtn}
                  id="register-back-btn"
                >
                  ← Change role
                </button>
              </>
            )}

            <p className={styles.loginPrompt}>
              Already have an account?{" "}
              <Link href="/login" className={styles.loginLink}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🌱</span>
            <span className={styles.logoText}>
              Farm<span className={styles.logoAccent}>Direct</span>
            </span>
          </div>
        </div>
        <div className={styles.right} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.spinner} style={{ width: '40px', height: '40px' }} />
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
