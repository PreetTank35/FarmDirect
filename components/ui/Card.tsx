import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "outlined" | "elevated" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick,
}: CardProps) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`pad-${padding}`],
    hover ? styles.hover : "",
    onClick ? styles.clickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}
