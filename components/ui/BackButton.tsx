"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./backButton.module.css";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ fallback = "/dashboard", label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // If the user has history in the app, window.history.length is > 1. 
    // Usually we just use router.back(), which preserves form state.
    // However, if they landed directly, router.back() might do nothing or leave the site.
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button onClick={handleBack} className={`${styles.button} ${className}`}>
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
