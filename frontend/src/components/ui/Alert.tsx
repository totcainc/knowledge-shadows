import { ReactNode } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface AlertProps {
  /** Alert variant */
  variant?: "info" | "success" | "warning" | "error";
  /** Alert title */
  title?: string;
  /** Alert message */
  children: ReactNode;
  /** Show close button */
  dismissible?: boolean;
  /** Close callback */
  onDismiss?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Alert component for displaying important messages
 */
export const Alert = ({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className = "",
}: AlertProps) => {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
      title: "text-blue-800",
      dismiss: "text-blue-500 hover:bg-blue-100",
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      title: "text-green-800",
      dismiss: "text-green-500 hover:bg-green-100",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
      title: "text-yellow-800",
      dismiss: "text-yellow-500 hover:bg-yellow-100",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
      title: "text-red-800",
      dismiss: "text-red-500 hover:bg-red-100",
    },
  };

  const styles = variants[variant];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 border rounded-lg
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icon || styles.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-medium ${styles.title}`}>{title}</h4>
        )}
        <div className={`text-sm ${title ? "mt-1" : ""}`}>{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            ${styles.dismiss}
          `}
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";
