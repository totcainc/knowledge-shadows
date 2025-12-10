import { TextareaHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import {
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  MapPinIcon,
  PaperClipIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  FolderIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon as PaperAirplaneSolid } from "@heroicons/react/24/solid";

export interface RichTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Show action bar with send button */
  showActions?: boolean;
  /** Show rich text toolbar */
  showToolbar?: boolean;
  /** Send button text */
  sendButtonText?: string;
  /** Send callback */
  onSend?: (value: string) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Rich Textarea component with toolbar and action buttons
 */
export const RichTextarea = forwardRef<HTMLTextAreaElement, RichTextareaProps>(
  (
    {
      className = "",
      label,
      helperText,
      error,
      showActions = false,
      showToolbar = false,
      sendButtonText = "Send message",
      onSend,
      disabled,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() || "");
    const currentValue = value !== undefined ? value.toString() : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      props.onChange?.(e);
    };

    const handleSend = () => {
      if (currentValue.trim() && onSend) {
        onSend(currentValue.trim());
        if (value === undefined) {
          setInternalValue("");
        }
      }
    };

    const ToolbarButton = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
      <button
        type="button"
        onClick={onClick}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
      >
        {children}
      </button>
    );

    return (
      <div className={`w-full ${className}`}>
        {/* Label and Helper in header */}
        {(label || helperText) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {helperText && !showActions && (
              <span className="text-sm text-gray-500">{helperText}</span>
            )}
          </div>
        )}

        <div className={`
          border rounded-lg overflow-hidden
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "opacity-50" : ""}
          focus-within:border-edubites-primary focus-within:ring-2 focus-within:ring-edubites-primary/20
        `}>
          {/* Rich Text Toolbar */}
          {showToolbar && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
              <ToolbarButton><PaperClipIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><MapPinIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><PhotoIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><CodeBracketIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><FaceSmileIcon className="w-5 h-5" /></ToolbarButton>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <ToolbarButton><Squares2X2Icon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><Cog6ToothIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><FolderIcon className="w-5 h-5" /></ToolbarButton>
              <ToolbarButton><ArrowDownTrayIcon className="w-5 h-5" /></ToolbarButton>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={ref}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={handleChange}
            disabled={disabled}
            className={`
              w-full px-4 py-3 text-sm
              bg-white
              focus:outline-none
              placeholder:text-gray-400
              resize-none min-h-[120px]
              disabled:cursor-not-allowed disabled:bg-gray-50
            `}
            {...props}
          />

          {/* Action Bar */}
          {showActions && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleSend}
                disabled={disabled || !currentValue.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-edubites-primary rounded-lg hover:bg-edubites-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperClipIcon className="w-4 h-4" />
                {sendButtonText}
              </button>
              <div className="flex items-center gap-1">
                <ToolbarButton><PaperClipIcon className="w-5 h-5" /></ToolbarButton>
                <ToolbarButton><MapPinIcon className="w-5 h-5" /></ToolbarButton>
                <ToolbarButton><PhotoIcon className="w-5 h-5" /></ToolbarButton>
              </div>
            </div>
          )}
        </div>

        {/* Helper/Error Text below */}
        {helperText && showActions && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !showActions && !label && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

RichTextarea.displayName = "RichTextarea";

// Inline Message Input (compact single-line style)
export interface MessageInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Send callback */
  onSend?: (value: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

export const MessageInput = ({
  placeholder = "Write text here ...",
  onSend,
  disabled = false,
  className = "",
}: MessageInputProps) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim() && onSend) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        disabled={disabled}
      >
        <PhotoIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        disabled={disabled}
      >
        <FaceSmileIcon className="w-5 h-5" />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20 placeholder:text-gray-400 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="p-2 text-edubites-primary hover:text-edubites-primary/80 disabled:text-gray-300 transition-colors"
      >
        <PaperAirplaneSolid className="w-5 h-5" />
      </button>
    </div>
  );
};

MessageInput.displayName = "MessageInput";
