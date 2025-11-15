import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  /** Trigger button content */
  trigger: React.ReactNode;
  /** Dropdown items */
  items: DropdownItem[];
  /** Item click handler */
  onItemClick?: (value: string) => void;
  /** Dropdown alignment */
  align?: "left" | "right";
  /** Custom trigger class */
  triggerClassName?: string;
}

/**
 * Dropdown menu component
 * 
 * @example
 * ```tsx
 * <Dropdown
 *   trigger="Actions"
 *   items={[
 *     { label: "Edit", value: "edit" },
 *     { label: "Delete", value: "delete", danger: true }
 *   ]}
 *   onItemClick={(value) => console.log(value)}
 * />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onItemClick,
  align = "left",
  triggerClassName,
}) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    onItemClick?.(item.value);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300",
          "hover:bg-neutral-50 transition-colors",
          triggerClassName
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
        <ChevronDown
          className={clsx(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          className={clsx(
            "absolute z-50 mt-2 min-w-[12rem] rounded-lg bg-white border border-neutral-200",
            "shadow-lg animate-slide-down",
            align === "right" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <React.Fragment key={item.value}>
                {item.divider ? (
                  <div className="my-1 border-t border-neutral-200" />
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors",
                      item.disabled
                        ? "text-neutral-400 cursor-not-allowed"
                        : item.danger
                        ? "text-error-600 hover:bg-error-50"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}
                    role="menuitem"
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = "Dropdown";
