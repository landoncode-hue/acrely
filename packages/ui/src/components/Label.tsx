import React from "react";
import { clsx } from "clsx";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Label text */
  children: React.ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Optional helper text */
  helperText?: string;
  /** Error message */
  error?: string;
}

/**
 * Label component for form inputs
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email Address</Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, helperText, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={clsx(
            "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error ? "text-error-600" : "text-neutral-700",
            className
          )}
          {...props}
        >
          {children}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
        {helperText && !error && (
          <p className="text-xs text-neutral-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Label.displayName = "Label";
