"use client";

import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import Button from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
  id?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  hideCloseButton = false,
  id = "modal",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      firstFocusRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      id={id}
    >
      <div className={`${styles.modal} ${styles[size]}`}>
        {(title || !hideCloseButton) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {title && (
                <h2 id={`${id}-title`} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={`${id}-desc`} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                ref={firstFocusRef}
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close modal"
                id={`${id}-close`}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
