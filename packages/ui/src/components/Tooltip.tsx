import React from "react";
import { clsx } from "clsx";

export interface TooltipProps {
  /** Tooltip content */
  content: string;
  /** Child element that triggers tooltip */
  children: React.ReactElement;
  /** Tooltip position */
  position?: "top" | "bottom" | "left" | "right";
  /** Delay before showing (ms) */
  delay?: number;
}

/**
 * Tooltip component for contextual help
 * 
 * @example
 * ```tsx
 * <Tooltip content="Click to save changes" position="top">
 *   <Button>Save</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 300,
}) => {
  const [show, setShow] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div
          className={clsx(
            "absolute z-50 px-3 py-2 text-sm text-white bg-neutral-900 rounded-lg",
            "shadow-lg animate-fade-in pointer-events-none whitespace-nowrap",
            positions[position]
          )}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={clsx(
              "absolute w-2 h-2 bg-neutral-900 rotate-45",
              position === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              position === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              position === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
              position === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = "Tooltip";
