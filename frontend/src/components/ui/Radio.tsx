import { InputHTMLAttributes, forwardRef } from "react";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper/description text */
  helperText?: string;
  /** Size of the radio */
  size?: "sm" | "md" | "lg";
  /** Dark mode */
  darkMode?: boolean;
}

/**
 * Radio button component for single selection from a group
 * Uses purple (#7E3AF2) for the checked state per eduBITES design system
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
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
        radio: "w-4 h-4",
        dot: "w-2 h-2",
        label: "text-sm",
        helper: "text-xs",
        gap: "gap-2",
      },
      md: {
        radio: "w-5 h-5",
        dot: "w-2.5 h-2.5",
        label: "text-sm",
        helper: "text-sm",
        gap: "gap-3",
      },
      lg: {
        radio: "w-6 h-6",
        dot: "w-3 h-3",
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
        {/* Radio container - aligns with first line of text */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="radio"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />
          {/* Radio circle */}
          <div
            className={`
              ${s.radio}
              flex items-center justify-center
              border-2 rounded-full
              ${colors.bg} ${colors.border}
              peer-checked:border-[#7E3AF2]
              peer-focus-visible:ring-4 peer-focus-visible:ring-[#7E3AF2]/20
              ${disabled ? "opacity-50" : ""}
              transition-colors
            `}
          />
          {/* Inner dot - shows on checked */}
          <div
            className={`
              ${s.dot}
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              bg-[#7E3AF2] rounded-full
              opacity-0 peer-checked:opacity-100
              pointer-events-none
              transition-opacity
              ${disabled ? "opacity-50" : ""}
            `}
          />
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

Radio.displayName = "Radio";

// Radio Group Component
export interface RadioGroupProps {
  /** Name for the radio group (required for grouping) */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Options for the radio group */
  options: Array<{
    value: string;
    label: string;
    helperText?: string;
    disabled?: boolean;
  }>;
  /** Size of all radios */
  size?: "sm" | "md" | "lg";
  /** Orientation of the group */
  orientation?: "vertical" | "horizontal";
  /** Dark mode */
  darkMode?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Radio group component for managing multiple radio buttons
 */
export const RadioGroup = ({
  name,
  value,
  defaultValue,
  onChange,
  options,
  size = "md",
  orientation = "vertical",
  darkMode = false,
  className = "",
}: RadioGroupProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div
      className={`flex ${
        orientation === "vertical" ? "flex-col gap-3" : "flex-row gap-6"
      } ${className}`}
      role="radiogroup"
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          helperText={option.helperText}
          size={size}
          disabled={option.disabled}
          darkMode={darkMode}
          defaultChecked={defaultValue === option.value}
          checked={value !== undefined ? value === option.value : undefined}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};

RadioGroup.displayName = "RadioGroup";
