import { AxiosError } from 'axios';

/**
 * Standard error response from our API
 */
export interface ApiErrorResponse {
  error: {
    type: string;
    message: string;
    status_code: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  type?: string;
}

/**
 * User-friendly error messages for common HTTP status codes
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input.',
  401: 'You need to log in to perform this action.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may already exist.',
  413: 'The file is too large. Please try a smaller file.',
  422: 'The data provided is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Please try again later.',
  502: 'The service is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
};

/**
 * Extract a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const response = error.response;

    // Check for our standardized error format
    if (response?.data?.error?.message) {
      return response.data.error.message;
    }

    // Check for FastAPI default format
    if (response?.data?.detail) {
      if (typeof response.data.detail === 'string') {
        return response.data.detail;
      }
      // Validation errors array
      if (Array.isArray(response.data.detail)) {
        return response.data.detail
          .map((err: { msg?: string; message?: string }) => err.msg || err.message)
          .join('. ');
      }
    }

    // Fall back to HTTP status message
    if (response?.status && HTTP_ERROR_MESSAGES[response.status]) {
      return HTTP_ERROR_MESSAGES[response.status];
    }

    // Network error
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract validation errors from an API error response
 */
export function getValidationErrors(error: unknown): ValidationError[] {
  if (!isAxiosError(error)) {
    return [];
  }

  const response = error.response;

  // Check our standardized format
  if (response?.data?.error?.details?.validation_errors) {
    return response.data.error.details.validation_errors;
  }

  // Check FastAPI default format
  if (response?.data?.detail && Array.isArray(response.data.detail)) {
    return response.data.detail.map((err: { loc?: string[]; msg?: string; type?: string }) => ({
      field: err.loc?.slice(1).join('.') || 'unknown',
      message: err.msg || 'Invalid value',
      type: err.type,
    }));
  }

  return [];
}

/**
 * Check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Check if an error is a specific HTTP status code
 */
export function isHttpError(error: unknown, statusCode: number): boolean {
  return isAxiosError(error) && error.response?.status === statusCode;
}

/**
 * Check if error is a 401 Unauthorized
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isHttpError(error, 401);
}

/**
 * Check if error is a 403 Forbidden
 */
export function isForbiddenError(error: unknown): boolean {
  return isHttpError(error, 403);
}

/**
 * Check if error is a 404 Not Found
 */
export function isNotFoundError(error: unknown): boolean {
  return isHttpError(error, 404);
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  return isHttpError(error, 422);
}

/**
 * Check if error is a network error (no response received)
 */
export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !error.response && error.code === 'ERR_NETWORK';
}

/**
 * Log error to console (and potentially to external service)
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const prefix = context ? `[${context}]` : '';

  console.error(`${prefix} Error:`, message);

  if (isAxiosError(error)) {
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }

  // TODO: In production, send to error tracking service
  // Sentry.captureException(error, { extra: { context } });
}
