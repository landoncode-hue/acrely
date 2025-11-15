import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label text */
  label?: string;
  /** Options for the select */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Select dropdown component
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Role"
 *   options={[
 *     { value: "admin", label: "Administrator" },
 *     { value: "user", label: "User" }
 *   ]}
 *   placeholder="Select a role"
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, helperText, size = "md", className, required, ...props }, ref) => {
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-base",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            required={required}
            className={clsx(
              "w-full appearance-none rounded-lg border bg-white transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-error-300 focus:ring-error-500 focus:border-error-500"
                : "border-neutral-300 focus:ring-primary-500 focus:border-primary-500",
              props.disabled && "bg-neutral-100 cursor-not-allowed opacity-60",
              sizeStyles[size],
              "pr-10", // Space for chevron icon
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
