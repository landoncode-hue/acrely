import React from "react";
import { clsx } from "clsx";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert variant */
  variant?: "info" | "success" | "warning" | "error";
  /** Alert title */
  title?: string;
  /** Alert description */
  children: React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Custom icon */
  icon?: React.ReactNode;
}

/**
 * Alert component for displaying important messages
 * 
 * @example
 * ```tsx
 * <Alert variant="success" title="Success">
 *   Your changes have been saved.
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", title, children, closable, onClose, icon, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(true);

    const variants = {
      info: {
        container: "bg-info-50 border-info-200 text-info-900",
        icon: <Info className="h-5 w-5 text-info-600" />,
        title: "text-info-900",
      },
      success: {
        container: "bg-success-50 border-success-200 text-success-900",
        icon: <CheckCircle className="h-5 w-5 text-success-600" />,
        title: "text-success-900",
      },
      warning: {
        container: "bg-warning-50 border-warning-200 text-warning-900",
        icon: <AlertTriangle className="h-5 w-5 text-warning-600" />,
        title: "text-warning-900",
      },
      error: {
        container: "bg-error-50 border-error-200 text-error-900",
        icon: <AlertCircle className="h-5 w-5 text-error-600" />,
        title: "text-error-900",
      },
    };

    const config = variants[variant];

    const handleClose = () => {
      setVisible(false);
      onClose?.();
    };

    if (!visible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          "relative rounded-lg border p-4",
          config.container,
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">{icon || config.icon}</div>
          <div className="flex-1 min-w-0">
            {title && (
              <h5 className={clsx("font-semibold mb-1", config.title)}>{title}</h5>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {closable && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-auto opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
