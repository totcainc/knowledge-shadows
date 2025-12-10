import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options for the select */
  options: SelectOption[];
  /** Currently selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Visual variant */
  variant?: "default" | "underline" | "filled";
  /** Dark mode */
  darkMode?: boolean;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Select/Dropdown component for single selection
 */
export const Select = ({
  options,
  value,
  defaultValue,
  placeholder = "Select an option",
  label,
  helperText,
  error,
  disabled = false,
  size = "md",
  variant = "default",
  darkMode = false,
  onChange,
  className = "",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle controlled component
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const sizes = {
    sm: {
      trigger: "px-3 py-1.5 text-sm",
      dropdown: "text-sm",
      item: "px-3 py-2",
    },
    md: {
      trigger: "px-4 py-2.5 text-sm",
      dropdown: "text-sm",
      item: "px-4 py-2.5",
    },
    lg: {
      trigger: "px-4 py-3 text-base",
      dropdown: "text-base",
      item: "px-4 py-3",
    },
  };

  // Light mode variants
  const lightVariants = {
    default: {
      base: "bg-white border border-gray-300 rounded-lg",
      focus: "border-edubites-primary ring-2 ring-edubites-primary/20",
      error: "border-red-500",
    },
    underline: {
      base: "bg-transparent border-b border-gray-300 rounded-none",
      focus: "border-edubites-primary",
      error: "border-red-500",
    },
    filled: {
      base: "bg-gray-50 border border-gray-200 rounded-lg",
      focus: "border-edubites-primary ring-2 ring-edubites-primary/20 bg-white",
      error: "border-red-500",
    },
  };

  // Dark mode variants - matching Figma exactly
  const darkVariants = {
    default: {
      base: "bg-[#2e2e2e] border border-[#575757] rounded-lg",
      focus: "border-edubites-primary ring-2 ring-edubites-primary/20",
      error: "border-[#F98080]",
    },
    underline: {
      base: "bg-transparent border-b border-[#575757] rounded-none",
      focus: "border-edubites-primary",
      error: "border-[#F98080]",
    },
    filled: {
      base: "bg-[#2e2e2e] border border-[#575757] rounded-lg",
      focus: "border-edubites-primary ring-2 ring-edubites-primary/20",
      error: "border-[#F98080]",
    },
  };

  const variants = darkMode ? darkVariants : lightVariants;

  // Colors based on dark mode - matching Figma exactly
  const colors = {
    label: darkMode ? "text-white" : "text-gray-700",
    placeholder: darkMode ? "text-[#a5a5a5]" : "text-gray-500",
    text: darkMode ? "text-white" : "text-gray-900",
    icon: darkMode ? "text-[#a5a5a5]" : "text-gray-400",
    helper: darkMode ? "text-[#a5a5a5]" : "text-gray-500",
    error: darkMode ? "text-[#F98080]" : "text-red-600",
    dropdown: {
      bg: darkMode ? "bg-[#2e2e2e] border-[#575757]" : "bg-white border-gray-200",
      hover: darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-edubites-background",
      selected: darkMode ? "bg-[#3a3a3a] text-edubites-primary" : "bg-edubites-background text-edubites-primary",
      disabled: darkMode ? "text-[#707070]" : "text-gray-400",
    },
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className={`block text-sm font-medium ${colors.label} mb-1`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          ${sizes[size].trigger}
          ${variants[variant].base}
          ${error ? variants[variant].error : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : `cursor-pointer ${darkMode ? "hover:border-gray-500" : "hover:border-gray-400"}`}
          ${isOpen ? variants[variant].focus : ""}
          transition-all
        `}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? colors.text : colors.placeholder}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 ${colors.icon} transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-1
            ${colors.dropdown.bg} border rounded-lg shadow-lg
            max-h-60 overflow-auto
            ${sizes[size].dropdown}
          `}
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => !option.disabled && handleSelect(option.value)}
              className={`
                ${sizes[size].item}
                flex items-center gap-2
                ${option.disabled
                  ? `${colors.dropdown.disabled} cursor-not-allowed`
                  : `${colors.text} cursor-pointer ${colors.dropdown.hover}`
                }
                ${selectedValue === option.value ? `${colors.dropdown.selected} font-medium` : ""}
              `}
              role="option"
              aria-selected={selectedValue === option.value}
              aria-disabled={option.disabled}
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Helper/Error Text */}
      {error && <p className={`mt-1 text-sm ${colors.error}`}>{error}</p>}
      {helperText && !error && <p className={`mt-1 text-sm ${colors.helper}`}>{helperText}</p>}
    </div>
  );
};

Select.displayName = "Select";

// Dropdown Menu Component (for custom content)
export interface DropdownMenuProps {
  /** Trigger element */
  trigger: ReactNode;
  /** Menu items */
  children: ReactNode;
  /** Alignment of the dropdown */
  align?: "left" | "right";
  /** Width of the dropdown */
  width?: "auto" | "trigger" | number;
  /** Dark mode */
  darkMode?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Generic dropdown menu for custom content
 */
export const DropdownMenu = ({
  trigger,
  children,
  align = "left",
  width = "auto",
  darkMode = false,
  className = "",
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const widthClass = width === "auto" ? "w-auto" : width === "trigger" ? "w-full" : "";
  const widthStyle = typeof width === "number" ? { width: `${width}px` } : {};

  const dropdownBg = darkMode ? "bg-[#2e2e2e] border-[#575757]" : "bg-white border-gray-200";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1
            ${dropdownBg} border rounded-lg shadow-lg
            ${align === "right" ? "right-0" : "left-0"}
            ${widthClass}
          `}
          style={widthStyle}
        >
          {children}
        </div>
      )}
    </div>
  );
};

DropdownMenu.displayName = "DropdownMenu";

// Dropdown Item Component
export interface DropdownItemProps {
  /** Item content */
  children: ReactNode;
  /** Icon to display */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Danger/destructive style */
  danger?: boolean;
  /** Dark mode */
  darkMode?: boolean;
  /** Additional class name */
  className?: string;
}

export const DropdownItem = ({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  darkMode = false,
  className = "",
}: DropdownItemProps) => {
  const getStyles = () => {
    if (disabled) {
      return darkMode ? "text-[#707070] cursor-not-allowed" : "text-gray-400 cursor-not-allowed";
    }
    if (danger) {
      return darkMode
        ? "text-[#F98080] cursor-pointer hover:bg-red-900/20"
        : "text-red-600 cursor-pointer hover:bg-red-50";
    }
    return darkMode
      ? "text-white cursor-pointer hover:bg-[#3a3a3a]"
      : "text-gray-900 cursor-pointer hover:bg-edubites-background";
  };

  return (
    <div
      onClick={() => !disabled && onClick?.()}
      className={`
        px-4 py-2.5 flex items-center gap-3
        text-sm
        ${getStyles()}
        ${className}
      `}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children}
    </div>
  );
};

DropdownItem.displayName = "DropdownItem";

// Dropdown Divider
export interface DropdownDividerProps {
  darkMode?: boolean;
}

export const DropdownDivider = ({ darkMode = false }: DropdownDividerProps) => (
  <div className={`border-t ${darkMode ? "border-[#575757]" : "border-gray-200"} my-1`} />
);

DropdownDivider.displayName = "DropdownDivider";

// Dropdown Header
export interface DropdownHeaderProps {
  children: ReactNode;
  darkMode?: boolean;
  className?: string;
}

export const DropdownHeader = ({ children, darkMode = false, className = "" }: DropdownHeaderProps) => (
  <div className={`px-4 py-3 ${darkMode ? "text-white" : "text-gray-700"} ${className}`}>{children}</div>
);

DropdownHeader.displayName = "DropdownHeader";
