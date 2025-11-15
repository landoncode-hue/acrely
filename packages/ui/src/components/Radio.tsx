import React from "react";
import { clsx } from "clsx";

export interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group label */
  label?: string;
  /** Radio options */
  options: RadioOption[];
  /** Selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Group name */
  name: string;
  /** Error message */
  error?: string;
  /** Layout orientation */
  orientation?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Required field */
  required?: boolean;
}

/**
 * Radio group component for single selections
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Payment Method"
 *   name="payment"
 *   options={[
 *     { value: "card", label: "Credit Card" },
 *     { value: "cash", label: "Cash" }
 *   ]}
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      options,
      value,
      defaultValue,
      onChange,
      name,
      error,
      orientation = "vertical",
      size = "md",
      required,
      ...props
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleChange = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
    };

    const sizeStyles = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const dotSizeStyles = {
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
    };

    return (
      <div ref={ref} className="w-full" {...props}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div
          className={clsx(
            "flex gap-4",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
          )}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-start gap-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={() => handleChange(option.value)}
                  disabled={option.disabled}
                  className="peer sr-only"
                  required={required && selectedValue === ""}
                />
                <div
                  className={clsx(
                    "flex items-center justify-center rounded-full border-2 transition-all cursor-pointer",
                    "peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary-500",
                    selectedValue === option.value
                      ? "bg-white border-primary-600"
                      : "bg-white border-neutral-300 hover:border-neutral-400",
                    error && "border-error-500",
                    option.disabled && "opacity-50 cursor-not-allowed",
                    sizeStyles[size]
                  )}
                >
                  {selectedValue === option.value && (
                    <div className={clsx("bg-primary-600 rounded-full", dotSizeStyles[size])} />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label
                  className={clsx(
                    "block text-sm font-medium cursor-pointer",
                    error ? "text-error-600" : "text-neutral-700",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !option.disabled && handleChange(option.value)}
                >
                  {option.label}
                </label>
                {option.helperText && (
                  <p className="mt-0.5 text-xs text-neutral-500">{option.helperText}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
