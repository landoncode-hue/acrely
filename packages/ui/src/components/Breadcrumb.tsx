import React from "react";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator icon */
  separator?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Breadcrumb component for navigation hierarchy
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: "Home", onClick: () => navigate("/") },
 *     { label: "Customers", onClick: () => navigate("/customers") },
 *     { label: "John Doe" }
 *   ]}
 * />
 * ```
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={clsx("flex items-center", className)}>
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href || item.onClick ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={clsx(
                    "text-sm font-medium transition-colors",
                    isLast
                      ? "text-neutral-900 cursor-default"
                      : "text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="text-sm font-medium text-neutral-900"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-neutral-400" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = "Breadcrumb";
