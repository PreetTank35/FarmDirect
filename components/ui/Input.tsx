import React, { forwardRef } from "react";
import styles from "./Input.module.css";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Build input class names directly — CSS Modules can't scope descendant selectors
    const inputClassName = [
      styles.input,
      error ? styles.inputError : "",
      leftIcon ? styles.inputWithLeftIcon : "",
      rightIcon ? styles.inputWithRightIcon : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.iconLeft} aria-hidden="true">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClassName}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className={styles.iconRight}>{rightIcon}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

