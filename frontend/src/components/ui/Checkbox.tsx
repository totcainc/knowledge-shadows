import { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper/description text */
  helperText?: string;
  /** Size of the checkbox */
  size?: "sm" | "md" | "lg";
  /** Dark mode */
  darkMode?: boolean;
}

/**
 * Checkbox component for multiple selections
 * Uses purple (#7E3AF2) for the checked state per eduBITES design system
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className = "",
      label,
      helperText,
      size = "md",
      disabled,
      darkMode = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: {
        checkbox: "w-4 h-4",
        icon: "w-2.5 h-2.5",
        label: "text-sm",
        helper: "text-xs",
        gap: "gap-2",
      },
      md: {
        checkbox: "w-5 h-5",
        icon: "w-3 h-3",
        label: "text-sm",
        helper: "text-sm",
        gap: "gap-3",
      },
      lg: {
        checkbox: "w-6 h-6",
        icon: "w-3.5 h-3.5",
        label: "text-base",
        helper: "text-sm",
        gap: "gap-3",
      },
    };

    const s = sizes[size];

    // Dark mode colors - matching Figma exactly
    const colors = {
      bg: darkMode ? "bg-[#2e2e2e]" : "bg-gray-50",
      border: darkMode ? "border-[#575757]" : "border-gray-300",
      label: darkMode
        ? disabled ? "text-[#707070]" : "text-white"
        : disabled ? "text-gray-400" : "text-gray-900",
      helper: darkMode
        ? disabled ? "text-[#707070]" : "text-[#a5a5a5]"
        : disabled ? "text-gray-400" : "text-gray-500",
    };

    return (
      <label
        className={`inline-flex items-start ${s.gap} ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } group ${className}`}
      >
        {/* Checkbox container - aligns with first line of text */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />
          {/* Checkbox box */}
          <div
            className={`
              ${s.checkbox}
              flex items-center justify-center
              border-2 rounded
              ${colors.bg} ${colors.border}
              peer-checked:bg-[#7E3AF2] peer-checked:border-[#7E3AF2]
              peer-focus-visible:ring-4 peer-focus-visible:ring-[#7E3AF2]/20
              ${disabled ? "opacity-50" : ""}
              transition-colors
            `}
          />
          {/* Checkmark SVG - positioned absolutely, shows on checked */}
          <svg
            className={`
              ${s.icon}
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              text-white
              opacity-0 peer-checked:opacity-100
              pointer-events-none
              transition-opacity
            `}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {(label || helperText) && (
          <div className="flex flex-col min-w-0">
            {label && (
              <span
                className={`${s.label} font-medium leading-tight ${colors.label}`}
              >
                {label}
              </span>
            )}
            {helperText && (
              <span
                className={`${s.helper} leading-tight ${colors.helper}`}
              >
                {helperText}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
