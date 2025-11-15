import React from "react";
import { clsx } from "clsx";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Spinner color variant */
  variant?: "primary" | "white" | "neutral";
  /** Loading text */
  label?: string;
}

/**
 * Spinner component for loading states
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" label="Loading..." />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", variant = "primary", label, className, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
      xl: "h-12 w-12 border-4",
    };

    const variants = {
      primary: "border-primary-200 border-t-primary-600",
      white: "border-white/20 border-t-white",
      neutral: "border-neutral-200 border-t-neutral-600",
    };

    return (
      <div
        ref={ref}
        className={clsx("flex flex-col items-center justify-center gap-2", className)}
        role="status"
        aria-label={label || "Loading"}
        {...props}
      >
        <div
          className={clsx(
            "animate-spin rounded-full",
            sizes[size],
            variants[variant]
          )}
          aria-hidden="true"
        />
        {label && (
          <span className="text-sm text-neutral-600">{label}</span>
        )}
      </div>
    );
  }
);

Spinner.displayName = "Spinner";
