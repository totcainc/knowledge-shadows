import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show character count */
  showCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Dark mode */
  darkMode?: boolean;
}

/**
 * Textarea component for multi-line text input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = "",
      label,
      helperText,
      error,
      size = "md",
      showCount = false,
      maxLength,
      disabled,
      value,
      defaultValue,
      darkMode = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: {
        textarea: "px-3 py-2 text-sm",
        label: "text-xs",
        helper: "text-xs",
      },
      md: {
        textarea: "px-4 py-3 text-base",
        label: "text-sm",
        helper: "text-sm",
      },
      lg: {
        textarea: "px-4 py-4 text-lg",
        label: "text-base",
        helper: "text-base",
      },
    };

    // Dark mode colors - matching Figma exactly
    const colors = {
      bg: darkMode ? "bg-[#2e2e2e]" : "bg-white",
      border: darkMode ? "border-[#575757]" : "border-gray-300",
      text: darkMode ? "text-white" : "text-gray-900",
      placeholder: darkMode ? "placeholder:text-[#a5a5a5]" : "placeholder:text-gray-400",
      label: darkMode ? "text-white" : "text-gray-700",
      helper: darkMode ? "text-[#a5a5a5]" : "text-gray-500",
      count: darkMode ? "text-[#a5a5a5]" : "text-gray-400",
      error: darkMode ? "text-[#F98080]" : "text-red-600",
      errorBorder: darkMode ? "border-[#F98080]" : "border-red-500",
      disabledBg: darkMode ? "bg-[#252525]" : "bg-gray-50",
    };

    const currentLength = typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            className={`block ${sizes[size].label} font-medium ${colors.label} mb-1`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            className={`
              w-full ${sizes[size].textarea}
              ${colors.bg} ${colors.text} ${colors.placeholder}
              border rounded-lg
              ${error ? colors.errorBorder : colors.border}
              ${disabled ? `opacity-50 cursor-not-allowed ${colors.disabledBg}` : ""}
              focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20
              resize-y min-h-[100px]
              transition-colors
            `}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            {...props}
          />
        </div>

        <div className="flex justify-between items-start mt-1">
          <div>
            {error && (
              <p className={`${sizes[size].helper} ${colors.error}`}>{error}</p>
            )}
            {helperText && !error && (
              <p className={`${sizes[size].helper} ${colors.helper}`}>{helperText}</p>
            )}
          </div>
          {showCount && maxLength && (
            <span className={`${sizes[size].helper} ${colors.count}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
