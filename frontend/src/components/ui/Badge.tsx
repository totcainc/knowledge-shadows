import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The color theme */
  color?: "gray" | "red" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink";
  /** Size of the badge */
  size?: "sm" | "lg";
  /** Badge type */
  type?: "basic" | "circle" | "icon-only";
  /** Leading icon */
  icon?: ReactNode;
  /** Show remove button */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Dark mode */
  darkMode?: boolean;
  /** Badge content */
  children?: ReactNode;
}

// Color configurations from Figma design
// Light mode: solid colored background with dark text
// Dark mode basic: semi-transparent bg + colored border + colored text
// Dark mode circle/icon-only: semi-transparent bg + colored text (NO border)
const colorConfig = {
  gray: {
    light: {
      bg: "bg-gray-100",
      text: "text-gray-900",
      icon: "text-gray-500",
      remove: "text-gray-400 hover:text-gray-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#D1D5DB]", // gray-300
      icon: "text-[#D1D5DB]",
      remove: "text-gray-400 hover:text-gray-200",
      border: "border border-gray-500",
    },
  },
  red: {
    light: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "text-red-500",
      remove: "text-red-400 hover:text-red-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#F98080]", // red-400 exact
      icon: "text-[#F98080]",
      remove: "text-[#F98080] hover:text-red-300",
      border: "border border-[#F98080]",
    },
  },
  yellow: {
    light: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "text-yellow-500",
      remove: "text-yellow-400 hover:text-yellow-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#FACA15]", // yellow-300 exact
      icon: "text-[#FACA15]",
      remove: "text-[#FACA15] hover:text-yellow-200",
      border: "border border-[#FACA15]",
    },
  },
  green: {
    light: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "text-green-500",
      remove: "text-green-400 hover:text-green-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#31C48D]", // green-400 exact
      icon: "text-[#31C48D]",
      remove: "text-[#31C48D] hover:text-green-300",
      border: "border border-[#31C48D]",
    },
  },
  blue: {
    light: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "text-blue-500",
      remove: "text-blue-400 hover:text-blue-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#76A9FA]", // blue-400 exact
      icon: "text-[#76A9FA]",
      remove: "text-[#76A9FA] hover:text-blue-300",
      border: "border border-[#76A9FA]",
    },
  },
  indigo: {
    light: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      icon: "text-indigo-500",
      remove: "text-indigo-400 hover:text-indigo-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#8DA2FB]", // indigo-400 exact
      icon: "text-[#8DA2FB]",
      remove: "text-[#8DA2FB] hover:text-indigo-300",
      border: "border border-[#8DA2FB]",
    },
  },
  purple: {
    light: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: "text-purple-500",
      remove: "text-purple-400 hover:text-purple-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#AC94FA]", // purple-400 exact
      icon: "text-[#AC94FA]",
      remove: "text-[#AC94FA] hover:text-purple-300",
      border: "border border-[#AC94FA]",
    },
  },
  pink: {
    light: {
      bg: "bg-pink-100",
      text: "text-pink-800",
      icon: "text-pink-500",
      remove: "text-pink-400 hover:text-pink-600",
    },
    dark: {
      bg: "bg-[#3a3a3a]",
      text: "text-[#E74694]", // pink-500 exact from Figma
      icon: "text-[#E74694]",
      remove: "text-[#E74694] hover:text-pink-300",
      border: "border border-[#E74694]",
    },
  },
};

/**
 * Badge component for labels, tags, and status indicators
 * Based on eduBITES Design System
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className = "",
      color = "gray",
      size = "sm",
      type = "basic",
      icon,
      removable = false,
      onRemove,
      darkMode = false,
      children,
      ...props
    },
    ref
  ) => {
    const mode = darkMode ? "dark" : "light";
    const colors = colorConfig[color][mode];

    // Size configurations from Figma
    const sizes = {
      sm: {
        padding: type === "basic" ? "px-2.5 py-0.5" : "p-0.5",
        text: "text-xs",
        iconSize: "w-3.5 h-3.5",
        removeSize: "w-3.5 h-3.5",
        gap: "gap-1",
        minSize: type === "circle" || type === "icon-only" ? "w-5 h-5" : "",
      },
      lg: {
        padding: type === "basic" ? "px-3 py-0.5" : "p-0.5",
        text: "text-sm",
        iconSize: "w-4 h-4",
        removeSize: "w-3.5 h-3.5",
        gap: "gap-1",
        minSize: type === "circle" || type === "icon-only" ? "w-6 h-6" : "",
      },
    };

    const sizeConfig = sizes[size];

    // Border radius based on type
    const borderRadius = type === "basic" ? "rounded-md" : "rounded-full";

    // Border: only for basic type in dark mode
    const borderStyle = darkMode && type === "basic" && "border" in colors ? colors.border : "";

    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium leading-normal
      ${colors.bg}
      ${colors.text}
      ${borderStyle}
      ${sizeConfig.text}
      ${sizeConfig.padding}
      ${sizeConfig.gap}
      ${sizeConfig.minSize}
      ${borderRadius}
    `;

    // Render icon-only badge
    if (type === "icon-only") {
      return (
        <span
          ref={ref}
          className={`${baseStyles} ${className}`}
          {...props}
        >
          {icon || <CheckIcon className={`${sizeConfig.iconSize} ${colors.icon}`} />}
        </span>
      );
    }

    // Render circle badge (for numbers/counts)
    if (type === "circle") {
      return (
        <span
          ref={ref}
          className={`${baseStyles} ${className}`}
          {...props}
        >
          {children}
        </span>
      );
    }

    // Render basic badge
    return (
      <span
        ref={ref}
        className={`${baseStyles} ${className}`}
        {...props}
      >
        {icon && (
          <span className={`${sizeConfig.iconSize} ${colors.icon} flex-shrink-0`}>
            {icon}
          </span>
        )}
        <span>{children}</span>
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={`${colors.remove} flex-shrink-0 transition-colors`}
            aria-label="Remove"
          >
            <XMarkIcon className={sizeConfig.removeSize} />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";
