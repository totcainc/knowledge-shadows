import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { authApi, tokenHelpers } from '../api/auth';
import type { User, RegisterRequest } from '../api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenHelpers.getAccessToken();
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          // Token might be expired, the client interceptor will handle refresh
          // If refresh also fails, tokens will be cleared and user redirected
          tokenHelpers.removeTokens();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    tokenHelpers.setTokens(response.access_token, response.refresh_token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    tokenHelpers.setTokens(response.access_token, response.refresh_token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    // Call server to invalidate refresh token
    await authApi.logout();
    tokenHelpers.removeTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
