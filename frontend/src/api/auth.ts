import { apiClient } from './client';
import type { AuthResponse, RegisterRequest, RefreshTokenResponse, User } from './types';

// Auth endpoints
export const authApi = {
  // Register a new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // OAuth2 form data format
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Get current user info
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  // Refresh tokens
  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout (invalidates refresh token on server)
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Ignore errors on logout - we'll clear local tokens anyway
    }
  },
};

// Token management helpers
export const tokenHelpers = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  removeTokens: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Legacy methods for backwards compatibility
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('access_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
