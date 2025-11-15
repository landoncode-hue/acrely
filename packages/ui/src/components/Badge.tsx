import React from "react";
import { clsx } from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info" | "outline";
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Children content */
  children: React.ReactNode;
  /** Leading icon */
  icon?: React.ReactNode;
  /** Show dot indicator */
  dot?: boolean;
}

/**
 * Badge component for status indicators and labels
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", children, icon, dot, className, ...props }, ref) => {
    const variants = {
      default: "bg-neutral-100 text-neutral-800 border-neutral-200",
      primary: "bg-primary-100 text-primary-800 border-primary-200",
      success: "bg-success-100 text-success-800 border-success-200",
      warning: "bg-warning-100 text-warning-800 border-warning-200",
      error: "bg-error-100 text-error-800 border-error-200",
      info: "bg-info-100 text-info-800 border-info-200",
      outline: "bg-white text-neutral-700 border-neutral-300",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    const dotSizes = {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    };

    const iconSizes = {
      sm: "h-3 w-3",
      md: "h-3.5 w-3.5",
      lg: "h-4 w-4",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center gap-1.5 font-medium rounded-full border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx("rounded-full bg-current", dotSizes[size])}
            aria-hidden="true"
          />
        )}
        {icon && <span className={clsx(iconSizes[size])}>{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
