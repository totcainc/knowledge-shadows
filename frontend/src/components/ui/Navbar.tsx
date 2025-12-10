import { ReactNode, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export interface NavItem {
  /** Label to display */
  label: string;
  /** URL/href for the link */
  href?: string;
  /** Whether this item is active */
  active?: boolean;
  /** Icon to display */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
}

export interface NavbarProps {
  /** Logo or brand element */
  logo?: ReactNode;
  /** Navigation items */
  items?: NavItem[];
  /** Right side content (e.g., user menu, actions) */
  rightContent?: ReactNode;
  /** Sticky positioning */
  sticky?: boolean;
  /** Click handler for nav items */
  onItemClick?: (item: NavItem) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Navbar component for top navigation
 */
export const Navbar = ({
  logo,
  items = [],
  rightContent,
  sticky = false,
  onItemClick,
  className = "",
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (item: NavItem) => (e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onItemClick) {
      e.preventDefault();
      onItemClick(item);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`
        bg-white border-b border-gray-200
        ${sticky ? "sticky top-0 z-40" : ""}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">{logo}</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                onClick={handleItemClick(item)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  flex items-center gap-2
                  transition-colors
                  ${item.active
                    ? "bg-edubites-background text-edubites-primary"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Content */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {rightContent}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.href || "#"}
                  onClick={handleItemClick(item)}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-medium
                    flex items-center gap-3
                    ${item.active
                      ? "bg-edubites-background text-edubites-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
            {rightContent && (
              <div className="mt-4 pt-4 border-t border-gray-200 px-4">
                {rightContent}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

Navbar.displayName = "Navbar";
