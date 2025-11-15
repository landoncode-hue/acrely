import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Checkbox component for boolean selections
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   name="terms"
 * />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, size = "md", className, ...props }, ref) => {
    const sizeStyles = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const iconSizeStyles = {
      sm: "h-3 w-3",
      md: "h-3.5 w-3.5",
      lg: "h-4 w-4",
    };

    const [checked, setChecked] = React.useState(props.checked || props.defaultChecked || false);

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setChecked(props.checked);
      }
    }, [props.checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              checked={checked}
              onChange={handleChange}
              {...props}
            />
            <div
              className={clsx(
                "flex items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                "peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary-500",
                checked
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-neutral-300 hover:border-neutral-400",
                error && "border-error-500",
                props.disabled && "opacity-50 cursor-not-allowed",
                sizeStyles[size],
                className
              )}
            >
              {checked && (
                <Check className={clsx("text-white", iconSizeStyles[size])} strokeWidth={3} />
              )}
            </div>
          </div>
          {(label || helperText || error) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label
                  className={clsx(
                    "block text-sm font-medium cursor-pointer",
                    error ? "text-error-600" : "text-neutral-700",
                    props.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {label}
                </label>
              )}
              {helperText && !error && (
                <p className="mt-0.5 text-xs text-neutral-500">{helperText}</p>
              )}
              {error && (
                <p className="mt-0.5 text-xs text-error-600">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
