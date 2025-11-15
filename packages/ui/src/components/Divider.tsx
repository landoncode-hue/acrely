import React from "react";
import { clsx } from "clsx";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the divider */
  orientation?: "horizontal" | "vertical";
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "center" | "right";
}

/**
 * Divider component for visual separation
 * 
 * @example
 * ```tsx
 * <Divider />
 * <Divider label="OR" labelPosition="center" />
 * <Divider orientation="vertical" className="h-24" />
 * ```
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", label, labelPosition = "center", className, ...props }, ref) => {
    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          className={clsx("w-px bg-neutral-200", className)}
          role="separator"
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    if (label) {
      const positions = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      };

      return (
        <div
          ref={ref}
          className={clsx("flex items-center", positions[labelPosition], className)}
          role="separator"
          {...props}
        >
          {labelPosition !== "left" && (
            <div className="flex-1 border-t border-neutral-200" />
          )}
          <span className="px-4 text-sm text-neutral-500 font-medium">{label}</span>
          {labelPosition !== "right" && (
            <div className="flex-1 border-t border-neutral-200" />
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx("border-t border-neutral-200", className)}
        role="separator"
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";
