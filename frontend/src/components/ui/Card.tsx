import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the card has hover effects */
  hover?: boolean;
  /** Padding size */
  padding?: "sm" | "md" | "lg";
}

/**
 * Container component for grouping related content
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = true, padding = "md", children, ...props }, ref) => {
    const baseStyles = "bg-white border border-edubites-card-stroke rounded-lg shadow-edubites-sm";
    const hoverStyles = hover ? "hover:shadow-edubites transition-shadow" : "";

    const paddings = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
