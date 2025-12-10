import { HTMLAttributes, forwardRef } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Color variant */
  variant?: "primary" | "ongoing" | "success";
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Visual indicator of progress or completion status
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className = "",
      value,
      max = 100,
      showLabel = false,
      variant = "ongoing",
      size = "md",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      primary: "bg-edubites-primary",
      ongoing: "bg-edubites-ongoing-content",
      success: "bg-green-500",
    };

    const sizes = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
          <div
            className={`${sizes[size]} rounded-full transition-all duration-300 ${variants[variant]}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
