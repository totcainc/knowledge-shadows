import { ReactNode, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface SidebarItem {
  /** Unique identifier */
  id: string;
  /** Label to display */
  label: string;
  /** Icon to display */
  icon?: ReactNode;
  /** URL/href for the link */
  href?: string;
  /** Whether this item is active */
  active?: boolean;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Nested items */
  children?: SidebarItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface SidebarProps {
  /** Header content (e.g., logo) */
  header?: ReactNode;
  /** Navigation items */
  items: SidebarItem[];
  /** Footer content */
  footer?: ReactNode;
  /** Collapsed state */
  collapsed?: boolean;
  /** Click handler for items */
  onItemClick?: (item: SidebarItem) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Sidebar navigation component
 */
export const Sidebar = ({
  header,
  items,
  footer,
  collapsed = false,
  onItemClick,
  className = "",
}: SidebarProps) => {
  return (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-gray-200
        ${collapsed ? "w-16" : "w-64"}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className="px-4 py-4 border-b border-gray-200">{header}</div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-4 border-t border-gray-200">{footer}</div>
      )}
    </aside>
  );
};

Sidebar.displayName = "Sidebar";

// Internal component for sidebar items
interface SidebarItemComponentProps {
  item: SidebarItem;
  collapsed: boolean;
  onItemClick?: (item: SidebarItem) => void;
  depth?: number;
}

const SidebarItemComponent = ({
  item,
  collapsed,
  onItemClick,
  depth = 0,
}: SidebarItemComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onItemClick) {
      e.preventDefault();
      onItemClick(item);
    }
  };

  const paddingLeft = collapsed ? "px-2" : `pl-${4 + depth * 3}`;

  return (
    <li>
      <a
        href={item.href || "#"}
        onClick={handleClick}
        className={`
          flex items-center gap-3 py-2.5 rounded-lg
          text-sm font-medium
          transition-colors
          ${collapsed ? "justify-center px-2" : "px-3"}
          ${item.active
            ? "bg-edubites-background text-edubites-primary"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        {item.icon && (
          <span className="flex-shrink-0 w-5 h-5 [&>svg]:w-full [&>svg]:h-full">{item.icon}</span>
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-edubites-primary text-white rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </span>
            )}
          </>
        )}
      </a>

      {/* Nested items */}
      {hasChildren && isExpanded && !collapsed && (
        <ul className="mt-1 space-y-1 ml-4">
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              onItemClick={onItemClick}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Section Header for grouping
export interface SidebarSectionProps {
  /** Section title */
  title: string;
  /** Children items */
  children: ReactNode;
  /** Collapsed state */
  collapsed?: boolean;
}

export const SidebarSection = ({
  title,
  children,
  collapsed = false,
}: SidebarSectionProps) => {
  if (collapsed) {
    return <div className="mt-4">{children}</div>;
  }

  return (
    <div className="mt-6 first:mt-0">
      <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
};

SidebarSection.displayName = "SidebarSection";
