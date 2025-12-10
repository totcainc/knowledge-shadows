import { InputHTMLAttributes, forwardRef } from "react";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper/description text */
  helperText?: string;
  /** Size of the toggle */
  size?: "sm" | "md" | "lg";
  /** Position of the label */
  labelPosition?: "left" | "right";
  /** Dark mode */
  darkMode?: boolean;
}

/**
 * Toggle/Switch component for boolean settings
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className = "",
      label,
      helperText,
      size = "md",
      labelPosition = "right",
      disabled,
      checked,
      defaultChecked,
      darkMode = false,
      ...props
    },
    ref
  ) => {
    const trackSizes = {
      sm: "w-9 h-5",
      md: "w-11 h-6",
      lg: "w-14 h-7",
    };

    const thumbSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const thumbTranslate = {
      sm: "peer-checked:translate-x-4",
      md: "peer-checked:translate-x-5",
      lg: "peer-checked:translate-x-7",
    };

    const textSizes = {
      sm: { label: "text-sm", helper: "text-xs" },
      md: { label: "text-sm", helper: "text-xs" },
      lg: { label: "text-base", helper: "text-sm" },
    };

    // Dark mode colors - matching Figma exactly
    const colors = {
      trackBg: darkMode ? "bg-[#575757]" : "bg-gray-200",
      label: darkMode
        ? disabled ? "text-[#707070]" : "text-white"
        : disabled ? "text-gray-400" : "text-gray-900",
      helper: darkMode
        ? disabled ? "text-[#707070]" : "text-[#a5a5a5]"
        : disabled ? "text-gray-300" : "text-gray-500",
    };

    const labelContent = (label || helperText) && (
      <div className={labelPosition === "left" ? "mr-3" : "ml-3"}>
        {label && (
          <span
            className={`${textSizes[size].label} font-medium ${colors.label}`}
          >
            {label}
          </span>
        )}
        {helperText && (
          <p
            className={`${textSizes[size].helper} ${colors.helper}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );

    return (
      <label
        className={`inline-flex items-center ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
      >
        {labelPosition === "left" && labelContent}
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            {...props}
          />
          <div
            className={`${trackSizes[size]} ${colors.trackBg} rounded-full peer peer-checked:bg-[#2CE080] peer-focus:ring-4 peer-focus:ring-[#2CE080]/20 ${
              disabled ? "opacity-50" : ""
            } transition-colors`}
          />
          <div
            className={`${thumbSizes[size]} absolute left-0.5 top-0.5 bg-white rounded-full shadow-sm transition-transform ${thumbTranslate[size]} ${
              disabled ? "opacity-75" : ""
            }`}
          />
        </div>
        {labelPosition === "right" && labelContent}
      </label>
    );
  }
);

Toggle.displayName = "Toggle";
