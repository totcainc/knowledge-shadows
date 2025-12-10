import { InputHTMLAttributes, forwardRef, useState, KeyboardEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface TagInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Current tags */
  value?: string[];
  /** Default tags */
  defaultValue?: string[];
  /** Callback when tags change */
  onChange?: (tags: string[]) => void;
  /** Placeholder when no tags */
  placeholder?: string;
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Allow duplicates */
  allowDuplicates?: boolean;
  /** Validate tag before adding (return true to allow, false to reject) */
  validateTag?: (tag: string) => boolean;
  /** Additional class name */
  className?: string;
}

/**
 * TagInput component for managing multiple tags/values
 * Based on eduBITES Design System
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      label,
      helperText,
      error,
      value,
      defaultValue = [],
      onChange,
      placeholder = "Add a tag...",
      maxTags,
      allowDuplicates = false,
      validateTag,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
    const [inputValue, setInputValue] = useState("");

    const tags = value !== undefined ? value : internalTags;

    const updateTags = (newTags: string[]) => {
      if (value === undefined) {
        setInternalTags(newTags);
      }
      onChange?.(newTags);
    };

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim();

      if (!trimmedTag) return;
      if (maxTags && tags.length >= maxTags) return;
      if (!allowDuplicates && tags.includes(trimmedTag)) return;
      if (validateTag && !validateTag(trimmedTag)) return;

      updateTags([...tags, trimmedTag]);
      setInputValue("");
    };

    const removeTag = (index: number) => {
      if (disabled) return;
      const newTags = tags.filter((_, i) => i !== index);
      updateTags(newTags);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
      } else if (e.key === "," || e.key === "Tab") {
        if (inputValue.trim()) {
          e.preventDefault();
          addTag(inputValue);
        }
      }
    };

    const handleBlur = () => {
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            {label}
          </label>
        )}

        <div
          className={`
            flex flex-wrap items-center gap-2
            px-3 py-2
            bg-white border rounded-lg
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "opacity-50 bg-gray-50 cursor-not-allowed" : ""}
            focus-within:border-edubites-primary focus-within:ring-2 focus-within:ring-edubites-primary/20
            transition-colors
          `}
        >
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1
                bg-gray-100 text-gray-900
                text-xs font-medium
                rounded-md
                ${disabled ? "" : ""}
              `}
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}

          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
            className={`
              flex-1 min-w-[120px]
              bg-transparent
              text-sm text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              disabled:cursor-not-allowed
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";
