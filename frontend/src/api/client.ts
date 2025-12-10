import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Extend config to track retry count and refresh attempt
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _isRefreshRequest?: boolean;
  _hasRefreshed?: boolean;
}

// Check if error is retryable (network errors or 5xx server errors)
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network error
    return true;
  }
  // Retry on server errors (500, 502, 503, 504)
  return error.response.status >= 500 && error.response.status < 600;
};

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config._retryCount = config._retryCount ?? 0;

    // Check if we should retry for server errors
    if (isRetryableError(error) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;

      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
      console.warn(`API request failed, retrying (${config._retryCount}/${MAX_RETRIES}) in ${backoffDelay}ms...`);

      await delay(backoffDelay);
      return apiClient(config);
    }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !config._isRefreshRequest && !config._hasRefreshed) {
      const refreshToken = localStorage.getItem('refresh_token');

      // No refresh token available - redirect to login
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            config._hasRefreshed = true;
            resolve(apiClient(config));
          });
          // If refresh fails, this request will also fail
          setTimeout(() => {
            if (refreshSubscribers.length === 0) {
              reject(error);
            }
          }, 10000); // 10 second timeout for queued requests
        });
      }

      isRefreshing = true;

      try {
        // Make refresh request
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        isRefreshing = false;
        onTokenRefreshed(access_token);

        // Retry the original request with new token
        config.headers.Authorization = `Bearer ${access_token}`;
        config._hasRefreshed = true;
        return apiClient(config);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed();

        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
