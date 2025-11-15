import React from "react";
import { clsx } from "clsx";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Progress bar size */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "primary" | "success" | "warning" | "error";
  /** Label position */
  labelPosition?: "inside" | "top" | "bottom";
}

/**
 * Progress bar component
 * 
 * @example
 * ```tsx
 * <Progress value={65} showLabel />
 * <Progress value={45} variant="success" size="lg" />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      showLabel = false,
      size = "md",
      variant = "primary",
      labelPosition = "top",
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    const variants = {
      primary: "bg-primary-600",
      success: "bg-success-600",
      warning: "bg-warning-600",
      error: "bg-error-600",
    };

    const label = `${Math.round(percentage)}%`;

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {showLabel && labelPosition === "top" && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">{label}</span>
          </div>
        )}
        <div
          className={clsx(
            "w-full bg-neutral-200 rounded-full overflow-hidden",
            sizes[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-300 ease-in-out flex items-center justify-center",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === "inside" && size === "lg" && (
              <span className="text-xs font-medium text-white px-2">{label}</span>
            )}
          </div>
        </div>
        {showLabel && labelPosition === "bottom" && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-neutral-700">{label}</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";
