import React from "react";
import { clsx } from "clsx";

export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  /** Available tabs */
  tabs: Tab[];
  /** Currently active tab value */
  value: string;
  /** Tab change handler */
  onChange: (value: string) => void;
  /** Tabs variant */
  variant?: "line" | "pills";
  /** Full width tabs */
  fullWidth?: boolean;
}

/**
 * Tabs component for navigation between views
 * 
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { label: "Overview", value: "overview" },
 *     { label: "Settings", value: "settings" }
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  variant = "line",
  fullWidth = false,
}) => {
  return (
    <div
      role="tablist"
      className={clsx(
        "flex",
        variant === "line" && "border-b border-neutral-200",
        variant === "pills" && "gap-2 p-1 bg-neutral-100 rounded-lg",
        fullWidth && "w-full"
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          aria-disabled={tab.disabled}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onChange(tab.value)}
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all",
            fullWidth && "flex-1 justify-center",
            tab.disabled && "opacity-50 cursor-not-allowed",
            variant === "line" && [
              value === tab.value
                ? "border-b-2 border-primary-600 text-primary-600"
                : "border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300",
            ],
            variant === "pills" && [
              "rounded-md",
              value === tab.value
                ? "bg-white text-primary-600 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
            ]
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && (
            <span
              className={clsx(
                "ml-1 px-2 py-0.5 text-xs font-semibold rounded-full",
                value === tab.value
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-200 text-neutral-700"
              )}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

Tabs.displayName = "Tabs";
