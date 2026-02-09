"use client";

/**
 * ShinyButton Component
 * Inspired by ReactBits (reactbits.dev) - Button Animations
 * Button with animated shimmer/shine effect
 */

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const ShinyButton = forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative overflow-hidden font-semibold rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg",
    };

    const variantStyles = {
      primary: "bg-primary text-primary-content hover:bg-primary/90 focus:ring-primary",
      secondary: "bg-secondary text-secondary-content hover:bg-secondary/90 focus:ring-secondary",
      success: "bg-success text-success-content hover:bg-success/90 focus:ring-success",
      gradient: "bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-90 focus:ring-primary",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect */}
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: "inherit" }}
        >
          <span
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
          />
        </span>

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <span className="loading loading-spinner loading-sm" />
          )}
          {children}
        </span>
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export default ShinyButton;
