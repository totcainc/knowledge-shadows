import { InputHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import { MagnifyingGlassIcon, ChevronDownIcon, MicrophoneIcon } from "@heroicons/react/24/outline";

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Search bar variant */
  variant?: "simple" | "with-button" | "with-category" | "with-location" | "inline-button" | "domain";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Placeholder text */
  placeholder?: string;
  /** Show voice input button */
  showVoiceInput?: boolean;
  /** Search callback */
  onSearch?: (value: string) => void;
  /** Category options for category variant */
  categories?: { value: string; label: string }[];
  /** Selected category */
  selectedCategory?: string;
  /** Category change callback */
  onCategoryChange?: (category: string) => void;
  /** Country options for location variant */
  countries?: { value: string; label: string; flag?: string }[];
  /** Selected country */
  selectedCountry?: string;
  /** Country change callback */
  onCountryChange?: (country: string) => void;
  /** Protocol options for domain variant */
  protocols?: { value: string; label: string }[];
  /** Selected protocol */
  selectedProtocol?: string;
  /** Protocol change callback */
  onProtocolChange?: (protocol: string) => void;
  /** Subdomain options for domain variant */
  subdomainOptions?: { value: string; label: string }[];
  /** Selected subdomain option */
  selectedSubdomain?: string;
  /** Subdomain change callback */
  onSubdomainChange?: (subdomain: string) => void;
  /** Button text for with-button variant */
  buttonText?: string;
  /** Additional class name */
  className?: string;
}

/**
 * SearchBar component with multiple variants for different use cases
 * Based on eduBITES Design System
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      variant = "simple",
      size = "md",
      placeholder = "Search...",
      showVoiceInput = false,
      onSearch,
      categories = [{ value: "all", label: "All categories" }],
      selectedCategory = "all",
      onCategoryChange,
      countries = [{ value: "usa", label: "USA", flag: "🇺🇸" }],
      selectedCountry = "usa",
      onCountryChange,
      protocols = [{ value: "http-https", label: "http + https" }],
      selectedProtocol = "http-https",
      onProtocolChange,
      subdomainOptions = [{ value: "subdomains", label: "Subdomains" }],
      selectedSubdomain = "subdomains",
      onSubdomainChange,
      buttonText = "Search",
      className = "",
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [protocolOpen, setProtocolOpen] = useState(false);
    const [subdomainOpen, setSubdomainOpen] = useState(false);

    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleSearch = () => {
      onSearch?.(currentValue.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    const sizes = {
      sm: {
        input: "py-2 text-sm",
        button: "px-3 py-2 text-sm",
        iconButton: "p-2",
        icon: "w-4 h-4",
      },
      md: {
        input: "py-2.5 text-sm",
        button: "px-4 py-2.5 text-sm",
        iconButton: "p-2.5",
        icon: "w-5 h-5",
      },
      lg: {
        input: "py-3 text-base",
        button: "px-5 py-3 text-base",
        iconButton: "p-3",
        icon: "w-5 h-5",
      },
    };

    const s = sizes[size];

    // Dropdown component
    const Dropdown = ({
      options,
      selected,
      onSelect,
      isOpen,
      setIsOpen,
      showFlag = false,
      position = "left",
    }: {
      options: { value: string; label: string; flag?: string }[];
      selected: string;
      onSelect?: (value: string) => void;
      isOpen: boolean;
      setIsOpen: (open: boolean) => void;
      showFlag?: boolean;
      position?: "left" | "right";
    }) => {
      const selectedOption = options.find((o) => o.value === selected);
      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center gap-2 ${s.input} px-4
              bg-gray-100 text-gray-900 font-medium
              hover:bg-gray-200 transition-colors
              whitespace-nowrap
            `}
            disabled={disabled}
          >
            {showFlag && selectedOption?.flag && (
              <span className="text-base">{selectedOption.flag}</span>
            )}
            <span>{selectedOption?.label}</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
          {isOpen && (
            <div
              className={`
                absolute z-50 mt-1 min-w-full
                bg-white border border-gray-200 rounded-lg shadow-lg
                ${position === "right" ? "right-0" : "left-0"}
              `}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                    hover:bg-gray-100 transition-colors
                    ${selected === option.value ? "bg-gray-50 text-edubites-primary font-medium" : "text-gray-900"}
                  `}
                >
                  {showFlag && option.flag && <span>{option.flag}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    };

    // Icon button
    const IconButton = ({ onClick, className: btnClass = "" }: { onClick?: () => void; className?: string }) => (
      <button
        type="button"
        onClick={onClick || handleSearch}
        disabled={disabled}
        className={`
          ${s.iconButton}
          bg-edubites-primary text-white
          hover:bg-edubites-primary/90
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors rounded-lg
          ${btnClass}
        `}
      >
        <MagnifyingGlassIcon className={s.icon} />
      </button>
    );

    // Simple search: input + icon button
    if (variant === "simple") {
      return (
        <div className={`flex items-stretch ${className}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className={`${s.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
            <input
              ref={ref}
              type="text"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full ${s.input} pl-10 pr-4
                bg-gray-50 border border-gray-300 border-r-0
                rounded-l-lg
                focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              {...props}
            />
          </div>
          <IconButton className="rounded-l-none" />
        </div>
      );
    }

    // Search with text button
    if (variant === "with-button") {
      return (
        <div className={`flex items-stretch ${className}`}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className={`${s.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
            <input
              ref={ref}
              type="text"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full ${s.input} pl-10 pr-4
                bg-gray-50 border border-gray-300 border-r-0
                rounded-l-lg
                focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              {...props}
            />
            {showVoiceInput && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={disabled}
              >
                <MicrophoneIcon className={s.icon} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled}
            className={`
              ${s.button}
              flex items-center gap-2
              bg-edubites-primary text-white font-medium
              hover:bg-edubites-primary/90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors rounded-r-lg
            `}
          >
            <MagnifyingGlassIcon className={s.icon} />
            {buttonText}
          </button>
        </div>
      );
    }

    // Category search: dropdown + input + icon button
    if (variant === "with-category") {
      return (
        <div className={`flex items-stretch rounded-lg border border-gray-300 overflow-hidden ${className}`}>
          <Dropdown
            options={categories}
            selected={selectedCategory}
            onSelect={onCategoryChange}
            isOpen={categoryOpen}
            setIsOpen={setCategoryOpen}
          />
          <div className="w-px bg-gray-300" />
          <div className="relative flex-1">
            <input
              ref={ref}
              type="text"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full ${s.input} px-4
                bg-gray-50
                focus:outline-none
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              {...props}
            />
          </div>
          <IconButton className="rounded-none" />
        </div>
      );
    }

    // Location search: country picker + input
    if (variant === "with-location") {
      return (
        <div className={`flex items-stretch rounded-lg border border-gray-300 overflow-hidden ${className}`}>
          <Dropdown
            options={countries}
            selected={selectedCountry}
            onSelect={onCountryChange}
            isOpen={countryOpen}
            setIsOpen={setCountryOpen}
            showFlag
          />
          <div className="w-px bg-gray-300" />
          <div className="relative flex-1">
            <input
              ref={ref}
              type="text"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full ${s.input} px-4
                bg-white
                focus:outline-none
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              {...props}
            />
          </div>
        </div>
      );
    }

    // Inline button search: input with button inside
    if (variant === "inline-button") {
      return (
        <div className={`relative ${className}`}>
          <MagnifyingGlassIcon className={`${s.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
          <input
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full ${s.input} pl-10 pr-24
              bg-gray-50 border border-gray-300
              rounded-lg
              focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20
              placeholder:text-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            {...props}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled}
            className={`
              absolute right-1.5 top-1/2 -translate-y-1/2
              px-3 py-1.5 text-xs font-semibold
              bg-edubites-primary text-white
              hover:bg-edubites-primary/90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors rounded-md
            `}
          >
            {buttonText}
          </button>
        </div>
      );
    }

    // Domain search: protocol dropdown + input + subdomain dropdown + icon button
    if (variant === "domain") {
      return (
        <div className={`flex items-stretch rounded-lg border border-gray-300 overflow-hidden ${className}`}>
          <Dropdown
            options={protocols}
            selected={selectedProtocol}
            onSelect={onProtocolChange}
            isOpen={protocolOpen}
            setIsOpen={setProtocolOpen}
          />
          <div className="w-px bg-gray-300" />
          <div className="relative flex-1">
            <input
              ref={ref}
              type="text"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full ${s.input} px-4
                bg-white
                focus:outline-none
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              {...props}
            />
          </div>
          <div className="w-px bg-gray-300" />
          <Dropdown
            options={subdomainOptions}
            selected={selectedSubdomain}
            onSelect={onSubdomainChange}
            isOpen={subdomainOpen}
            setIsOpen={setSubdomainOpen}
            position="right"
          />
          <IconButton className="rounded-none" />
        </div>
      );
    }

    // Default fallback to simple
    return (
      <div className={`flex items-stretch ${className}`}>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className={`${s.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
          <input
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full ${s.input} pl-10 pr-4
              bg-gray-50 border border-gray-300 border-r-0
              rounded-l-lg
              focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20
              placeholder:text-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            {...props}
          />
        </div>
        <IconButton className="rounded-l-none" />
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
