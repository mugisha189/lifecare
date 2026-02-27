import api, { ApiResponse } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser } from '../store/types';
import { mapBackendUserToFrontend, BackendUser } from './user.mapper';
import { STORAGE_KEYS } from '../store/storage';

const AUTH_TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
const REFRESH_TOKEN_KEY = '@lifecare_refresh_token';
const USER_KEY = STORAGE_KEYS.USER;

/**
 * Auth service for handling authentication operations
 */
export class AuthService {
  /**
   * Set auth token in storage and axios headers
   */
  private static async setAuthToken(token: string | null) {
    if (token) {
      console.log('[AuthService] Setting token in storage and axios headers');
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify it was stored
      const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('[AuthService] Token stored successfully:', !!stored);
    } else {
      console.log('[AuthService] Clearing token from storage');
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get auth token from storage
   */
  static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Set refresh token in storage
   */
  private static async setRefreshToken(token: string | null) {
    if (token) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Get refresh token from storage
   */
  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Initialize auth token from storage on app start
   */
  static async initializeAuth() {
    const token = await this.getAuthToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Register a new user
   */
  static async register(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    roleId?: string; // Optional - backend defaults to PATIENT
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    country?: string;
    city?: string;
    preferredLanguage?: 'EN' | 'FR' | 'RW';
  }): Promise<
    ApiResponse<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
      requiresVerification: boolean;
    }>
  > {
    try {
      // Format phone number to international format if needed
      const phoneNumber = data.phoneNumber.startsWith('+')
        ? data.phoneNumber
        : `+250${data.phoneNumber.replace(/^0/, '')}`;

      const response = await api.post<ApiResponse>('/auth/register', {
        ...data,
        phoneNumber,
      });

      if (response.data.ok && response.data.data) {
        // Map backend user to frontend format
        const mappedUser = mapBackendUserToFrontend(response.data.data.user as BackendUser);

        // Store tokens
        await this.setAuthToken(response.data.data.accessToken);
        await this.setRefreshToken(response.data.data.refreshToken);

        // Store user in AsyncStorage as well
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(mappedUser));

        // Return with mapped user
        return {
          ...response.data,
          data: {
            ...response.data.data,
            user: mappedUser,
          },
        };
      }

      return response.data;
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Registration failed. Please try again.';

        return {
          ok: false,
          message: errorMessage,
        };
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error during registration:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Login user
   */
  static async login(
    identifier: string,
    password: string
  ): Promise<ApiResponse<{ user: IUser; accessToken: string; refreshToken: string }>> {
    try {
      const response = await api.post<ApiResponse>('/auth/login', {
        identifier,
        password,
      });

      // Check if response has the ApiResponse format (ok field)
      if (response.data && 'ok' in response.data) {
        if (response.data.ok && response.data.data) {
          console.log('[AuthService] Login successful, storing tokens...');

          // Map backend user to frontend format
          const mappedUser = mapBackendUserToFrontend(response.data.data.user as BackendUser);

          // Store tokens
          await this.setAuthToken(response.data.data.accessToken);
          await this.setRefreshToken(response.data.data.refreshToken);

          // Store user in AsyncStorage as well
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(mappedUser));

          console.log('[AuthService] Tokens and user stored successfully');

          // Return with mapped user
          return {
            ...response.data,
            data: {
              ...response.data.data,
              user: mappedUser,
            },
          };
        }
        // Return error response in ApiResponse format
        return response.data;
      }

      // If response doesn't have 'ok' field, treat as success (shouldn't happen)
      return {
        ok: false,
        message: 'Unexpected response format from server',
      };
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Login failed. Please check your credentials.';

        return {
          ok: false,
          message: errorMessage,
        };
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error during login:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Login failed. Please check your credentials.',
      };
    }
  }

  /**
   * Verify OTP code
   */
  static async verifyOtp(otp: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/verify-otp', {
        otp,
      });

      return response.data;
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'OTP verification failed. Please try again.';

        return {
          ok: false,
          message: errorMessage,
        };
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error during OTP verification:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'OTP verification failed. Please try again.',
      };
    }
  }

  /**
   * Resend OTP code
   */
  static async resendOtp(email: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/resend-otp', {
        email,
      });

      return response.data;
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to resend OTP. Please try again.';

        return {
          ok: false,
          message: errorMessage,
        };
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error during resend OTP:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to resend OTP. Please try again.',
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return {
          ok: false,
          message: 'No refresh token available',
        };
      }

      const response = await api.post<ApiResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.data.ok && response.data.data) {
        await this.setAuthToken(response.data.data.accessToken);
        await this.setRefreshToken(response.data.data.refreshToken);
      }

      return response.data;
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      let errorMessage = 'Session expired. Please login again.';

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error during token refresh:', error.message);
      }

      // Clear tokens on refresh failure
      await this.setAuthToken(null);
      await this.setRefreshToken(null);
      await AsyncStorage.removeItem(USER_KEY);

      return {
        ok: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse> {
    try {
      const refreshToken = await this.getRefreshToken();

      // Call backend logout endpoint
      try {
        await api.post('/auth/logout', {
          refreshToken: refreshToken || undefined,
        });
      } catch (error) {
        // Continue with local logout even if backend call fails
        console.warn('Backend logout call failed, continuing with local logout:', error);
      }

      // Clear tokens locally
      await this.setAuthToken(null);
      await this.setRefreshToken(null);
      await AsyncStorage.removeItem(USER_KEY);

      return {
        ok: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      // Ensure tokens are cleared even on error
      await this.setAuthToken(null);
      await this.setRefreshToken(null);
      await AsyncStorage.removeItem(USER_KEY);

      return {
        ok: false,
        message: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<IUser>> {
    try {
      const response = await api.get<ApiResponse<BackendUser>>('/auth/me');
      if (response.data.ok && response.data.data) {
        const mappedUser = mapBackendUserToFrontend(response.data.data);
        return {
          ok: true,
          message: response.data.message,
          data: mappedUser,
        };
      }
      return {
        ok: false,
        message: response.data.message || 'Failed to get user profile',
      };
    } catch (error: any) {
      // Handle NestJS error format: { message, error, statusCode }
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Failed to get user profile';

        return {
          ok: false,
          message: errorMessage,
        };
      }

      // Only log unexpected errors in development
      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error getting user profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to get user profile',
      };
    }
  }

  /**
   * Change password (requires current password)
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const d = error.response.data;
        return {
          ok: false,
          message: d.message || d.error || 'Failed to change password',
        };
      }
      return {
        ok: false,
        message: error.message || 'Failed to change password',
      };
    }
  }

  /**
   * Delete current user account (soft delete). Call logout after success.
   */
  static async deleteAccount(): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/delete-account');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const d = error.response.data;
        return {
          ok: false,
          message: d.message || d.error || 'Failed to delete account',
        };
      }
      return {
        ok: false,
        message: error.message || 'Failed to delete account',
      };
    }
  }
}
