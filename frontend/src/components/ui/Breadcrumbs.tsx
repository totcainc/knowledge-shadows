import { ReactNode } from "react";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** URL/href for the link */
  href?: string;
  /** Icon to display */
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator between items */
  separator?: ReactNode;
  /** Show home icon at start */
  showHome?: boolean;
  /** Home link URL */
  homeHref?: string;
  /** Click handler for items */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Breadcrumbs navigation component
 */
export const Breadcrumbs = ({
  items,
  separator = <ChevronRightIcon className="w-4 h-4 text-gray-400" />,
  showHome = true,
  homeHref = "/",
  onItemClick,
  className = "",
}: BreadcrumbsProps) => {
  const handleClick = (item: BreadcrumbItem, index: number) => (e: React.MouseEvent) => {
    if (onItemClick) {
      e.preventDefault();
      onItemClick(item, index);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {showHome && (
          <>
            <li>
              <a
                href={homeHref}
                onClick={handleClick({ label: "Home", href: homeHref }, -1)}
                className="text-gray-500 hover:text-edubites-primary transition-colors"
                aria-label="Home"
              >
                <HomeIcon className="w-4 h-4" />
              </a>
            </li>
            {items.length > 0 && <li className="flex items-center">{separator}</li>}
          </>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <>
                  <a
                    href={item.href || "#"}
                    onClick={handleClick(item, index)}
                    className="text-gray-500 hover:text-edubites-primary transition-colors flex items-center gap-1"
                  >
                    {item.icon}
                    {item.label}
                  </a>
                  {separator}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.displayName = "Breadcrumbs";
