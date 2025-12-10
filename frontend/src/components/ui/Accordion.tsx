import { ReactNode, useState, createContext, useContext } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

interface AccordionContextValue {
  expandedItems: string[];
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
  darkMode: boolean;
  variant: "card" | "separate" | "flush";
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps {
  /** Allow multiple items to be expanded */
  allowMultiple?: boolean;
  /** Default expanded items */
  defaultExpanded?: string[];
  /** Accordion items */
  children: ReactNode;
  /** Dark mode */
  darkMode?: boolean;
  /** Visual style variant */
  variant?: "card" | "separate" | "flush";
  /** Additional class name */
  className?: string;
}

/**
 * Accordion container component
 * Based on eduBITES Design System - matches Figma exactly
 */
export const Accordion = ({
  allowMultiple = false,
  defaultExpanded = [],
  children,
  darkMode = false,
  variant = "card",
  className = "",
}: AccordionProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });
  };

  // Container styles based on variant
  const getContainerStyles = () => {
    if (variant === "card") {
      return `rounded-lg overflow-hidden shadow-sm divide-y ${
        darkMode ? "border border-[#444444] divide-[#444444]" : "border border-[#E5E7EB] divide-[#E5E7EB]"
      }`;
    }
    if (variant === "separate") {
      return "flex flex-col gap-4";
    }
    // flush - no container styling
    return "";
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, allowMultiple, darkMode, variant }}>
      <div className={`${getContainerStyles()} ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = "Accordion";

export interface AccordionItemProps {
  /** Unique identifier */
  id: string;
  /** Item title */
  title: ReactNode;
  /** Item content */
  children: ReactNode;
  /** Leading element (icon) */
  icon?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Accordion item component
 */
export const AccordionItem = ({
  id,
  title,
  children,
  icon,
  disabled = false,
  className = "",
}: AccordionItemProps) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const { expandedItems, toggleItem, darkMode, variant } = context;
  const isExpanded = expandedItems.includes(id);

  // Colors from Figma - exact hex values
  const colors = {
    // Light mode
    light: {
      expandedHeaderBg: "bg-[#F3F4F6]", // gray-100
      expandedTitle: "text-[#111928]", // gray-900
      expandedChevron: "text-[#111928]",
      collapsedHeaderBg: "bg-white",
      collapsedTitle: "text-[#6B7280]", // gray-500
      collapsedChevron: "text-[#6B7280]",
      contentBg: "bg-white",
      contentText: "text-[#6B7280]",
      border: "border-[#E5E7EB]", // gray-200
      divider: "bg-[#E5E7EB]",
    },
    // Dark mode
    dark: {
      expandedHeaderBg: "bg-[#2b2b2b]",
      expandedTitle: "text-white",
      expandedChevron: "text-white",
      collapsedHeaderBg: "bg-[#2b2b2b]",
      collapsedTitle: "text-[#9CA3AF]", // gray-400
      collapsedChevron: "text-[#9CA3AF]",
      contentBg: "bg-[#1d1d1d]",
      contentText: "text-[#9CA3AF]",
      border: "border-[#444444]",
      divider: "bg-[#444444]",
    },
  };

  const c = darkMode ? colors.dark : colors.light;

  // Get header styles based on variant and state
  const getHeaderStyles = () => {
    const baseStyles = "w-full flex items-center gap-3 p-5 text-left transition-colors";

    if (variant === "flush") {
      // Flush/Links style - no background, just dividers
      return `${baseStyles} py-6 px-0`;
    }

    if (variant === "separate") {
      // Separate cards - each item is its own card
      if (isExpanded) {
        return `${baseStyles} ${c.expandedHeaderBg} ${c.border} border-b-0 border rounded-t-lg`;
      }
      return `${baseStyles} ${c.collapsedHeaderBg} ${c.border} border rounded-lg`;
    }

    // Card style - single container
    if (isExpanded) {
      return `${baseStyles} ${c.expandedHeaderBg}`;
    }
    return `${baseStyles} ${c.collapsedHeaderBg}`;
  };

  // Get content styles based on variant
  const getContentStyles = () => {
    if (variant === "flush") {
      return "px-0 py-5";
    }

    if (variant === "separate") {
      return `${c.contentBg} ${c.border} border border-t-0 rounded-b-lg p-5`;
    }

    // Card style - no borders needed since container has divide-y
    return `${c.contentBg} p-5`;
  };

  const ChevronIcon = isExpanded ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div className={className}>
      {/* Divider for flush style */}
      {variant === "flush" && (
        <div className={`h-px w-full ${c.divider}`} />
      )}

      <button
        type="button"
        onClick={() => !disabled && toggleItem(id)}
        disabled={disabled}
        className={`
          ${getHeaderStyles()}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span
          className={`
            flex-1 font-medium text-base leading-none
            ${isExpanded ? c.expandedTitle : c.collapsedTitle}
            ${variant === "flush" ? "text-lg" : "text-base"}
          `}
        >
          {title}
        </span>
        <ChevronIcon
          className={`
            w-4 h-4 flex-shrink-0
            ${isExpanded ? c.expandedChevron : c.collapsedChevron}
          `}
        />
      </button>

      <div
        id={`accordion-content-${id}`}
        className={`
          grid transition-all duration-200 ease-in-out
          ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
      >
        <div className="overflow-hidden">
          <div className={`${getContentStyles()} ${c.contentText} text-base leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

AccordionItem.displayName = "AccordionItem";
