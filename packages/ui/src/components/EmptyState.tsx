import React from "react";
import { clsx } from "clsx";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
}

/**
 * Empty state component for when there's no data to display
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Inbox className="h-12 w-12" />}
 *   title="No customers yet"
 *   description="Get started by adding your first customer"
 *   action={<Button>Add Customer</Button>}
 * />
 * ```
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col items-center justify-center text-center py-12 px-4",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-neutral-400" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-600 mb-6 max-w-sm">{description}</p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
