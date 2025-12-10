import { ReactNode, useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface ToastProps {
  /** Toast variant */
  variant?: "info" | "success" | "warning" | "error";
  /** Toast title */
  title?: string;
  /** Toast message */
  children: ReactNode;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Close callback */
  onClose?: () => void;
  /** Show progress bar for auto-dismiss */
  showProgress?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Toast notification component for temporary messages
 */
export const Toast = ({
  variant = "info",
  title,
  children,
  duration = 5000,
  onClose,
  showProgress = true,
  className = "",
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - 100 / (duration / 100)));
      }, 100);

      const timeout = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const variants = {
    info: {
      container: "bg-white border-l-4 border-l-blue-500",
      icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
      progress: "bg-blue-500",
    },
    success: {
      container: "bg-white border-l-4 border-l-green-500",
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      progress: "bg-green-500",
    },
    warning: {
      container: "bg-white border-l-4 border-l-yellow-500",
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
      progress: "bg-yellow-500",
    },
    error: {
      container: "bg-white border-l-4 border-l-red-500",
      icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
      progress: "bg-red-500",
    },
  };

  const styles = variants[variant];

  return (
    <div
      className={`
        relative overflow-hidden
        ${styles.container}
        border border-gray-200 rounded-lg shadow-lg
        min-w-[320px] max-w-md
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-gray-900">{title}</h4>
          )}
          <div className={`text-sm text-gray-600 ${title ? "mt-1" : ""}`}>
            {children}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      {showProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className={`h-full transition-all duration-100 ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

Toast.displayName = "Toast";

// Toast Container for positioning multiple toasts
export interface ToastContainerProps {
  /** Position of the toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  /** Toast elements */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export const ToastContainer = ({
  position = "top-right",
  children,
  className = "",
}: ToastContainerProps) => {
  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`
        fixed z-50 flex flex-col gap-3
        ${positions[position]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

ToastContainer.displayName = "ToastContainer";
