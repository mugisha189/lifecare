import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user.types';
import api, { ApiResponse } from '../services/api';

const AUTH_TOKEN_KEY = '@lifecare_auth_token';
const REFRESH_TOKEN_KEY = '@lifecare_refresh_token';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch current user profile from the API
   */
  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await api.get<ApiResponse<User>>('/auth/me');

      if (response.data.ok && response.data.data) {
        setUser(response.data.data);
      } else {
        // Token might be invalid, clear it
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
      }
    } catch (error: any) {
      console.warn('Failed to refresh user:', error.message);
      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login function
   */
  const login = async (identifier: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await api.post<
        ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
      >('/auth/login', {
        identifier,
        password,
      });

      if (response.data.ok && response.data.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;

        // Store tokens
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        // Set user
        setUser(userData);

        return {
          ok: true,
          message: response.data.message || 'Login successful',
          data: response.data.data,
        };
      }

      return {
        ok: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error: any) {
      if (error.response?.data) {
        return {
          ok: false,
          message: error.response.data.message || error.response.data.error || 'Login failed',
        };
      }

      return {
        ok: false,
        message: error.message || 'Network error. Please try again.',
      };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Call logout endpoint (optional, but good practice)
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors during logout API call
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state and tokens
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    }
  };

  /**
   * Update user data locally (after profile update)
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  }, []);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
