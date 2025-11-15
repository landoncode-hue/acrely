import React from "react";
import { clsx } from "clsx";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: "text" | "circular" | "rectangular";
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
}

/**
 * Skeleton component for loading placeholders
 * 
 * @example
 * ```tsx
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" height={200} />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", width, height, lines = 1, className, style, ...props }, ref) => {
    const variants = {
      text: "rounded h-4",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    const baseStyles = "animate-pulse bg-neutral-200";

    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={clsx("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={clsx(baseStyles, variants.text)}
              style={{
                width: index === lines - 1 ? "75%" : "100%",
                ...style,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(baseStyles, variants[variant], className)}
        style={{
          width: width || (variant === "circular" ? height : "100%"),
          height: height || (variant === "text" ? "1rem" : "100%"),
          ...style,
        }}
        aria-label="Loading"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
