import { ReactNode } from "react";

export interface ListItemProps {
  /** Primary content */
  children: ReactNode;
  /** Secondary/description text */
  description?: ReactNode;
  /** Leading element (icon, avatar, etc.) */
  leading?: ReactNode;
  /** Trailing element (badge, action, etc.) */
  trailing?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * List item component
 */
export const ListItem = ({
  children,
  description,
  leading,
  trailing,
  onClick,
  selected = false,
  disabled = false,
  className = "",
}: ListItemProps) => {
  const isClickable = !!onClick && !disabled;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`
        flex items-center gap-3 px-4 py-3
        ${isClickable ? "cursor-pointer hover:bg-gray-50" : ""}
        ${selected ? "bg-edubites-background" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${selected ? "text-edubites-primary" : "text-gray-900"}`}>
          {children}
        </div>
        {description && (
          <div className="text-sm text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </div>
  );
};

ListItem.displayName = "ListItem";

export interface ListProps {
  /** List items */
  children: ReactNode;
  /** Show dividers between items */
  dividers?: boolean;
  /** Bordered container */
  bordered?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * List container component
 */
export const List = ({
  children,
  dividers = true,
  bordered = false,
  className = "",
}: ListProps) => {
  return (
    <div
      className={`
        bg-white
        ${bordered ? "border border-gray-200 rounded-lg" : ""}
        ${dividers ? "divide-y divide-gray-200" : ""}
        ${className}
      `}
      role="list"
    >
      {children}
    </div>
  );
};

List.displayName = "List";

// List Subheader
export interface ListSubheaderProps {
  children: ReactNode;
  className?: string;
}

export const ListSubheader = ({ children, className = "" }: ListSubheaderProps) => (
  <div
    className={`
      px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50
      ${className}
    `}
  >
    {children}
  </div>
);

ListSubheader.displayName = "ListSubheader";
