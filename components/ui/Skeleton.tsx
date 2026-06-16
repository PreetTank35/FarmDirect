import React from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  lines?: number;
  gap?: string;
}

export default function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius,
  className = "",
  lines,
  gap = "0.5rem",
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: borderRadius || undefined,
  };

  if (lines && lines > 1) {
    return (
      <div
        className={`${styles.group} ${className}`}
        style={{ gap }}
        aria-hidden="true"
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={styles.skeleton}
            style={{
              ...style,
              width: i === lines - 1 ? "70%" : width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Preset skeleton shapes
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return <Skeleton lines={lines} height="1em" />;
}

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton height="200px" borderRadius="var(--radius-lg)" />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Skeleton height="1.25rem" width="60%" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="2rem" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="var(--radius-full)"
    />
  );
}
