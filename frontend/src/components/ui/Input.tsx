import { InputHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Success message */
  successMessage?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Leading icon */
  leadingIcon?: ReactNode;
  /** Trailing icon */
  trailingIcon?: ReactNode;
  /** Show clear button when has value */
  clearable?: boolean;
  /** Clear callback */
  onClear?: () => void;
  /** Input variant */
  variant?: "default" | "search" | "password";
  /** Dark mode */
  darkMode?: boolean;
}

/**
 * Form input component with label, icons, states, and helper text support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      success,
      successMessage,
      helperText,
      size = "md",
      leadingIcon,
      trailingIcon,
      clearable = false,
      onClear,
      variant = "default",
      darkMode = false,
      type,
      disabled,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Size styles
    const sizes = {
      sm: {
        input: "px-3 py-2 text-sm",
        label: "text-xs",
        helper: "text-xs",
        icon: "w-4 h-4",
      },
      md: {
        input: "px-4 py-2.5 text-sm",
        label: "text-sm",
        helper: "text-sm",
        icon: "w-5 h-5",
      },
      lg: {
        input: "px-4 py-3 text-base",
        label: "text-base",
        helper: "text-sm",
        icon: "w-5 h-5",
      },
    };

    // Determine actual input type
    const inputType = variant === "password"
      ? (showPassword ? "text" : "password")
      : type;

    // Dark mode colors - matching Figma exactly
    const darkColors = {
      bg: "bg-[#2e2e2e]",
      border: "border-[#575757]",
      text: "text-white",
      placeholder: "placeholder:text-[#a5a5a5]",
      label: "text-white",
      helper: "text-[#a5a5a5]",
      icon: "text-[#a5a5a5]",
      focusBorder: "focus:border-edubites-primary",
      focusRing: "focus:ring-edubites-primary/20",
      errorBorder: "border-[#F98080]",
      errorText: "text-[#F98080]",
      successBorder: "border-[#31C48D]",
      successText: "text-[#31C48D]",
    };

    // Light mode colors
    const lightColors = {
      bg: "bg-gray-50",
      border: "border-gray-300",
      text: "text-gray-900",
      placeholder: "placeholder:text-gray-400",
      label: "text-gray-700",
      helper: "text-gray-500",
      icon: "text-gray-400",
      focusBorder: "focus:border-edubites-primary",
      focusRing: "focus:ring-edubites-primary/20",
      errorBorder: "border-red-500",
      errorText: "text-red-600",
      successBorder: "border-green-500",
      successText: "text-green-600",
    };

    const colors = darkMode ? darkColors : lightColors;

    // Determine leading icon
    const getLeadingIcon = () => {
      if (leadingIcon) return leadingIcon;
      if (variant === "search") return <MagnifyingGlassIcon className={`${sizes[size].icon} ${colors.icon}`} />;
      return null;
    };

    // Determine trailing icon/element
    const getTrailingElement = () => {
      if (error) {
        return <ExclamationCircleIcon className={`${sizes[size].icon} ${darkMode ? "text-[#F98080]" : "text-red-500"}`} />;
      }
      if (success) {
        return <CheckIcon className={`${sizes[size].icon} ${darkMode ? "text-[#31C48D]" : "text-green-500"}`} />;
      }
      if (variant === "password") {
        return (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`${colors.icon} hover:opacity-80 focus:outline-none`}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className={sizes[size].icon} />
            ) : (
              <EyeIcon className={sizes[size].icon} />
            )}
          </button>
        );
      }
      if (clearable && value) {
        return (
          <button
            type="button"
            onClick={onClear}
            className={`${colors.icon} hover:opacity-80 focus:outline-none`}
            tabIndex={-1}
          >
            <XMarkIcon className={sizes[size].icon} />
          </button>
        );
      }
      if (trailingIcon) return trailingIcon;
      return null;
    };

    const leadingIconElement = getLeadingIcon();
    const trailingElement = getTrailingElement();

    // Border styles based on state
    const getBorderStyles = () => {
      if (error) return `${colors.errorBorder} focus:${colors.errorBorder} focus:ring-red-500/20`;
      if (success) return `${colors.successBorder} focus:${colors.successBorder} focus:ring-green-500/20`;
      return `${colors.border} ${colors.focusBorder} ${colors.focusRing}`;
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block ${sizes[size].label} font-medium ${colors.label} mb-1`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leadingIconElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {leadingIconElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            value={value}
            className={`
              w-full ${sizes[size].input}
              ${leadingIconElement ? "pl-10" : ""}
              ${trailingElement ? "pr-10" : ""}
              ${colors.bg} ${colors.text} ${colors.placeholder}
              border rounded-lg
              ${getBorderStyles()}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              focus:outline-none focus:ring-2
              transition-all
            `}
            {...props}
          />

          {trailingElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {trailingElement}
            </div>
          )}
        </div>

        {/* Helper/Error/Success Text */}
        {error && (
          <p className={`mt-1 ${sizes[size].helper} ${colors.errorText}`}>{error}</p>
        )}
        {success && successMessage && (
          <p className={`mt-1 ${sizes[size].helper} ${colors.successText}`}>{successMessage}</p>
        )}
        {helperText && !error && !successMessage && (
          <p className={`mt-1 ${sizes[size].helper} ${colors.helper}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Search Input with dropdown suggestions
export interface SearchSuggestion {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface SearchInputProps extends Omit<InputProps, "variant" | "leadingIcon"> {
  /** Callback when search is submitted */
  onSearch?: (value: string) => void;
  /** Suggestions to show in dropdown */
  suggestions?: SearchSuggestion[];
  /** Callback when suggestion is selected */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Show suggestions dropdown */
  showSuggestions?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onKeyDown, suggestions = [], onSuggestionSelect, showSuggestions = false, darkMode = false, className = "", ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
        setIsOpen(false);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      onKeyDown?.(e);
    };

    const handleFocus = () => {
      if (suggestions.length > 0 && showSuggestions) {
        setIsOpen(true);
      }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      onSuggestionSelect?.(suggestion);
      setIsOpen(false);
    };

    const dropdownBg = darkMode ? "bg-[#2e2e2e] border-[#575757]" : "bg-white border-gray-200";
    const dropdownItemHover = darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-edubites-background";
    const dropdownText = darkMode ? "text-white" : "text-gray-900";

    return (
      <div className={`relative ${className}`}>
        <Input
          ref={ref}
          variant="search"
          darkMode={darkMode}
          placeholder="Placeholder text"
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          {...props}
        />
        {isOpen && suggestions.length > 0 && (
          <div className={`absolute z-50 w-full mt-1 ${dropdownBg} border rounded-lg shadow-lg max-h-60 overflow-auto`}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm ${dropdownText} ${dropdownItemHover} transition-colors`}
              >
                {suggestion.icon && <span className="text-gray-400">{suggestion.icon}</span>}
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Password Input convenience component
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "variant" | "type">>(
  (props, ref) => {
    return <Input ref={ref} variant="password" {...props} />;
  }
);

PasswordInput.displayName = "PasswordInput";
