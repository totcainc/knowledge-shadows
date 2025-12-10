import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visual style variant of the button */
  variant?: "primary" | "secondary" | "tertiary";
  /** The size of the button */
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Dark mode */
  darkMode?: boolean;
  /** Leading icon */
  leadingIcon?: ReactNode;
  /** Trailing icon */
  trailingIcon?: ReactNode;
}

/**
 * Button component for user interaction
 * Based on eduBITES Design System - matches Figma exactly
 *
 * States from Figma (Light Mode):
 * - Default: Normal appearance
 * - Disabled: 40% opacity
 * - Hover: 20% black overlay on bg
 * - While Pressing: Inverted colors
 * - Post-click: Gray (handled by app logic, not CSS)
 * - Focussed: Orange border (#FFA76B)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "base",
      loading = false,
      disabled,
      darkMode = false,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size configurations from Figma - exact pixel values
    // Figma button dimensions (with both icons + "Button" text):
    // XS: 115 x 34px (px 12, py 9, icon 16px, text 12px, gap 10px)
    // SM: 121 x 37px (px 12, py 10.5, icon 16px, text 14px, gap 10px)
    // Base: 145 x 41px (px 20, py 10.5, icon 20px, text 14px, gap 10px)
    // L: 151 x 48px (px 20, py 14, icon 20px, text 16px, gap 10px)
    // XL: 159 x 52px (px 24, py 16, icon 20px, text 16px, gap 10px)
    const sizes = {
      xs: {
        padding: { paddingLeft: 12, paddingRight: 12, paddingTop: 9, paddingBottom: 9 },
        text: "text-xs",
        iconSize: "w-4 h-4",
        gap: "gap-2.5",
        minHeight: 34,
      },
      sm: {
        padding: { paddingLeft: 12, paddingRight: 12, paddingTop: 10.5, paddingBottom: 10.5 },
        text: "text-sm",
        iconSize: "w-4 h-4",
        gap: "gap-2.5",
        minHeight: 37,
      },
      base: {
        padding: { paddingLeft: 20, paddingRight: 20, paddingTop: 10.5, paddingBottom: 10.5 },
        text: "text-sm",
        iconSize: "w-5 h-5",
        gap: "gap-2.5",
        minHeight: 41,
      },
      lg: {
        padding: { paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14 },
        text: "text-base",
        iconSize: "w-5 h-5",
        gap: "gap-2.5",
        minHeight: 48,
      },
      xl: {
        padding: { paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 },
        text: "text-base",
        iconSize: "w-5 h-5",
        gap: "gap-2.5",
        minHeight: 52,
      },
    };

    // Get styles based on variant and mode
    // From Figma: exact hex values for each state
    const getStyles = () => {
      if (darkMode) {
        // =====================================================================
        // DARK MODE STYLES
        // =====================================================================
        switch (variant) {
          case "primary":
            return {
              base: "bg-[#5845BA] text-white",
              hover: "hover:brightness-110",
              active: "active:bg-white active:shadow-[inset_0_0_0_1px_#9061F9] active:text-[#5521B5]",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-white",
              iconActive: "group-active:text-[#5521B5]",
            };
          case "secondary":
            return {
              base: "bg-[rgba(237,235,254,0.05)] shadow-[inset_0_0_0_1px_rgba(88,69,186,0.5)] text-[#AC94FA]",
              hover: "hover:bg-[rgba(237,235,254,0.1)]",
              active: "active:bg-[rgba(88,69,186,0.4)] active:text-white",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-[#AC94FA]",
              iconActive: "group-active:text-white",
            };
          case "tertiary":
            return {
              base: "bg-[#292929] shadow-[inset_0_0_0_1px_#575757] text-[#A5A5A5]",
              hover: "hover:bg-[#333333]",
              active: "active:bg-[#5521B5] active:text-white active:shadow-[inset_0_0_0_1px_#5521B5]",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-[#A5A5A5]",
              iconActive: "group-active:text-white",
            };
        }
      } else {
        // =====================================================================
        // LIGHT MODE STYLES (Exact from Figma)
        // =====================================================================
        switch (variant) {
          case "primary":
            // Default: #5845BA bg, white text
            // Hover: 20% black overlay
            // While Pressing: white bg, #9061F9 border, #5521B5 text
            // Focussed: #FFA76B border
            // Using inset shadow for active border to avoid size change
            return {
              base: "bg-[#5845BA] text-white",
              hover: "hover:bg-[#4637a0]",
              active: "active:bg-white active:shadow-[inset_0_0_0_1px_#9061F9] active:text-[#5521B5]",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-white",
              iconActive: "group-active:text-[#5521B5]",
            };
          case "secondary":
            // Default: #D5D0EF bg, rgba(88,69,186,0.25) border, #5845BA text
            // Hover: 20% black overlay
            // While Pressing: 40% black overlay, white text
            // Focussed: #FFA76B border
            // Using inset shadow for border to avoid size change
            return {
              base: "bg-[#D5D0EF] shadow-[inset_0_0_0_1px_rgba(88,69,186,0.25)] text-[#5845BA]",
              hover: "hover:bg-[#bbb5d4]",
              active: "active:bg-[#9a93b8] active:text-white",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-[#5845BA]",
              iconActive: "group-active:text-white",
            };
          case "tertiary":
            // Default: transparent bg, gray-200 border, #5521B5 text
            // Hover: 20% black bg overlay
            // While Pressing: #5521B5 bg, white text
            // Focussed: #FFA76B border
            // Using inset shadow for border to avoid size change
            return {
              base: "bg-transparent shadow-[inset_0_0_0_1px_#E5E7EB] text-[#5521B5]",
              hover: "hover:bg-black/20",
              active: "active:bg-[#5521B5] active:text-white active:shadow-none",
              focus: "focus:outline-none focus:ring-2 focus:ring-[#FFA76B]",
              iconDefault: "text-[#5521B5]",
              iconActive: "group-active:text-white",
            };
        }
      }
    };

    const styles = getStyles();
    const sizeConfig = sizes[size];

    // Build class string
    const buttonClasses = [
      // Base layout
      "group inline-flex items-center justify-center",
      "font-medium rounded-lg",
      "transition-all duration-150",
      // Size (text and gap only - padding via inline style)
      sizeConfig.text,
      sizeConfig.gap,
      // Variant base styles
      styles.base,
      // States (only if not disabled)
      isDisabled
        ? "opacity-40 cursor-not-allowed"
        : `cursor-pointer ${styles.hover} ${styles.active} ${styles.focus}`,
      // Custom className
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        {...props}
        className={buttonClasses}
        style={{ ...sizeConfig.padding, minHeight: sizeConfig.minHeight, ...props.style }}
        disabled={isDisabled}
      >
        {loading && (
          <svg
            className={`animate-spin ${sizeConfig.iconSize}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leadingIcon && (
          <span className={`${sizeConfig.iconSize} ${styles.iconDefault} ${styles.iconActive} flex-shrink-0 [&>svg]:w-full [&>svg]:h-full`}>
            {leadingIcon}
          </span>
        )}
        <span>{children}</span>
        {!loading && trailingIcon && (
          <span className={`${sizeConfig.iconSize} ${styles.iconDefault} ${styles.iconActive} flex-shrink-0 [&>svg]:w-full [&>svg]:h-full`}>
            {trailingIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
