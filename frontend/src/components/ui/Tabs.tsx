import { ReactNode, useState, createContext, useContext } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  /** Default active tab */
  defaultValue?: string;
  /** Controlled active tab */
  value?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Children (TabList and TabPanels) */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Tabs container component
 */
export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  children,
  className = "",
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const activeTab = value !== undefined ? value : internalValue;
  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={`
          ${orientation === "vertical" ? "flex gap-4" : ""}
          ${className}
        `}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = "Tabs";

export interface TabListProps {
  /** Tab triggers */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Container for tab triggers
 */
export const TabList = ({ children, className = "" }: TabListProps) => {
  return (
    <div
      className={`
        flex border-b border-gray-200
        ${className}
      `}
      role="tablist"
    >
      {children}
    </div>
  );
};

TabList.displayName = "TabList";

export interface TabTriggerProps {
  /** Tab value (must match TabPanel value) */
  value: string;
  /** Tab label */
  children: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to display */
  icon?: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Individual tab trigger button
 */
export const TabTrigger = ({
  value,
  children,
  disabled = false,
  icon,
  className = "",
}: TabTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used within Tabs");

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        px-4 py-3 text-sm font-medium
        border-b-2 -mb-px
        transition-colors
        flex items-center gap-2
        ${isActive
          ? "border-edubites-primary text-edubites-primary"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

TabTrigger.displayName = "TabTrigger";

export interface TabPanelProps {
  /** Panel value (must match TabTrigger value) */
  value: string;
  /** Panel content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Tab panel content
 */
export const TabPanel = ({ value, children, className = "" }: TabPanelProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabPanel must be used within Tabs");

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={`py-4 ${className}`}
    >
      {children}
    </div>
  );
};

TabPanel.displayName = "TabPanel";
