import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { CloudArrowUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export interface FileUploadProps {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Accepted file types */
  accept?: string;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max file size display text */
  maxSizeText?: string;
  /** File type description */
  fileTypeText?: string;
  /** Multiple files */
  multiple?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Variant style */
  variant?: "inline" | "dropzone" | "dropzone-button";
  /** Dark mode */
  darkMode?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * File Upload component with inline and dropzone variants
 */
export const FileUpload = ({
  label,
  helperText,
  accept,
  maxSize,
  maxSizeText = "Max. File Size: 30MB",
  fileTypeText = "SVG, PNG, JPG or GIF (MAX. 800x400px)",
  multiple = false,
  disabled = false,
  error,
  onFilesSelected,
  variant = "dropzone",
  darkMode = false,
  className = "",
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Filter by max size if specified
    const validFiles = maxSize
      ? fileArray.filter(f => f.size <= maxSize)
      : fileArray;

    setSelectedFiles(validFiles);
    onFilesSelected?.(validFiles);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Hidden input element
  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onChange={handleChange}
      className="hidden"
    />
  );

  // Colors matching Figma exactly
  // Light mode:
  //   - Inline button: #1f2a37 (dark gray)
  //   - Inline input bg: #F9FAFB (gray-50)
  //   - Border: #D1D5DB (gray-300)
  //   - Label: #111928
  //   - Helper: #767676
  //   - Dropzone bg: #F9FAFB
  //   - Dropzone border: #E5E7EB (gray-200)
  //   - Icon/text: #a5a5a5
  // Dark mode:
  //   - Inline button: #545454
  //   - Inline input bg: #2e2e2e
  //   - Border: #575757
  //   - Label: white
  //   - Helper: #a5a5a5
  //   - Dropzone bg: #3a3a3a
  //   - Dropzone border: #575757
  //   - Icon/text: #a5a5a5
  const colors = {
    // Labels
    label: darkMode ? "text-white" : "text-[#111928]",
    helper: darkMode ? "text-[#a5a5a5]" : "text-[#767676]",
    error: darkMode ? "text-[#F98080]" : "text-red-600",
    // Inline variant
    border: darkMode ? "border-[#575757]" : "border-[#D1D5DB]",
    errorBorder: darkMode ? "border-[#F98080]" : "border-red-500",
    buttonBg: darkMode ? "bg-[#545454]" : "bg-[#1f2a37]",
    fileBg: darkMode ? "bg-[#2e2e2e]" : "bg-[#F9FAFB]",
    fileText: darkMode ? "text-white" : "text-[#111928]",
    // Dropzone
    dropzoneBg: darkMode ? "bg-[#3a3a3a]" : "bg-[#F9FAFB]",
    dropzoneBorder: darkMode ? "border-[#575757]" : "border-[#E5E7EB]",
    dropzoneBorderHover: darkMode ? "hover:border-[#6a6a6a]" : "hover:border-[#D1D5DB]",
    dropzoneDragging: darkMode ? "border-edubites-primary bg-edubites-primary/10" : "border-edubites-primary bg-edubites-primary/5",
    icon: "text-[#a5a5a5]",
    // Text in dropzone - same color for both parts
    text: darkMode ? "text-[#a5a5a5]" : "text-[#767676]",
    textSecondary: darkMode ? "text-[#a5a5a5]" : "text-[#767676]",
    selectedFiles: darkMode ? "text-white" : "text-[#111928]",
  };

  // Inline variant - button + filename
  if (variant === "inline") {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className={`block text-sm font-medium ${colors.label} mb-3`}>
            {label}
          </label>
        )}

        <div className={`
          flex items-stretch
          border rounded-lg overflow-hidden
          ${colors.border}
          ${error ? colors.errorBorder : ""}
          ${disabled ? "opacity-50" : ""}
        `}>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`px-5 py-2.5 text-sm font-medium text-white ${colors.buttonBg} hover:opacity-90 disabled:cursor-not-allowed transition-colors whitespace-nowrap border-r ${colors.border}`}
          >
            Choose file
          </button>
          <div className={`flex-1 px-4 py-3 text-sm ${colors.fileText} ${colors.fileBg} flex items-center`}>
            {selectedFiles.length > 0
              ? selectedFiles.map(f => f.name).join(", ")
              : "No file chosen"
            }
          </div>
        </div>

        {hiddenInput}

        {error && <p className={`mt-3 text-xs ${colors.error}`}>{error}</p>}
        {helperText && !error && (
          <p className={`mt-3 text-xs ${colors.helper}`}>{helperText}</p>
        )}
      </div>
    );
  }

  // Dropzone variants
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-sm font-medium ${colors.label} mb-3`}>
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center
          py-12 px-4
          cursor-pointer
          transition-colors
          ${colors.dropzoneBg}
          ${isDragging
            ? colors.dropzoneDragging
            : `${colors.dropzoneBorder} ${colors.dropzoneBorderHover}`
          }
          ${error ? colors.errorBorder : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <CloudArrowUpIcon className={`w-10 h-10 ${colors.icon} mb-2`} />

        <p className={`text-sm ${colors.text} text-center`}>
          <span className="font-semibold">Click to upload</span>
          {" "}or drag and drop
        </p>

        <p className={`text-xs ${colors.textSecondary} mt-2 text-center`}>
          {fileTypeText}
        </p>

        {variant === "dropzone-button" && (
          <>
            <p className={`text-xs font-semibold ${colors.textSecondary} mt-2`}>
              {maxSizeText}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              disabled={disabled}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-edubites-primary rounded-lg hover:bg-edubites-primary/90 disabled:cursor-not-allowed transition-colors"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Browse File
            </button>
          </>
        )}

        {selectedFiles.length > 0 && (
          <div className={`mt-4 text-sm ${colors.selectedFiles}`}>
            {selectedFiles.map((f, i) => (
              <p key={i}>{f.name}</p>
            ))}
          </div>
        )}
      </div>

      {hiddenInput}

      {error && <p className={`mt-3 text-xs ${colors.error}`}>{error}</p>}
      {helperText && !error && (
        <p className={`mt-3 text-xs ${colors.helper}`}>{helperText}</p>
      )}
    </div>
  );
};

FileUpload.displayName = "FileUpload";
