import React from "react";
import { clsx } from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether to resize vertically */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

/**
 * Textarea component for multi-line text input
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description..."
 *   rows={4}
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, resize = "vertical", className, required, ...props }, ref) => {
    const resizeStyles = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          required={required}
          className={clsx(
            "w-full px-4 py-2.5 rounded-lg border transition-all",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-error-300 focus:ring-error-500 focus:border-error-500"
              : "border-neutral-300 focus:ring-primary-500 focus:border-primary-500",
            props.disabled && "bg-neutral-100 cursor-not-allowed opacity-60",
            resizeStyles[resize],
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
