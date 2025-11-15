import React from "react";
import { clsx } from "clsx";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (initials) */
  fallback?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Shape variant */
  shape?: "circle" | "square";
  /** Status indicator */
  status?: "online" | "offline" | "away" | "busy";
}

/**
 * Avatar component for user profiles
 * 
 * @example
 * ```tsx
 * <Avatar src="/avatar.jpg" alt="John Doe" size="lg" />
 * <Avatar fallback="JD" status="online" />
 * ```
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = "md", shape = "circle", status, className, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const shapes = {
      circle: "rounded-full",
      square: "rounded-lg",
    };

    const statusColors = {
      online: "bg-success-500",
      offline: "bg-neutral-400",
      away: "bg-warning-500",
      busy: "bg-error-500",
    };

    const statusSizes = {
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-4 w-4",
    };

    const showImage = src && !imageError;

    return (
      <div ref={ref} className={clsx("relative inline-flex", className)} {...props}>
        <div
          className={clsx(
            "flex items-center justify-center font-semibold text-white bg-primary-600 overflow-hidden",
            sizes[size],
            shapes[shape]
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={alt || "Avatar"}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{fallback || alt?.charAt(0).toUpperCase() || "?"}</span>
          )}
        </div>
        {status && (
          <span
            className={clsx(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
