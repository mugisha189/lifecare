import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../store/storage';

const AUTH_TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
const REFRESH_TOKEN_KEY = '@lifecare_refresh_token';
const USER_KEY = STORAGE_KEYS.USER;
const LANGUAGE_KEY = STORAGE_KEYS.LANGUAGE;

/** Called when token refresh fails so the app can clear user state and redirect to login */
let sessionExpiredCallback: (() => void) | null = null;
export function setSessionExpiredCallback(cb: () => void): void {
  sessionExpiredCallback = cb;
}

/**
 * Get API base URL from environment variables
 * Falls back to localhost:8081 for development if not set
 *
 * Note: For physical devices/emulators, use your machine's IP address instead of localhost
 * Example: http://192.168.1.100:8081/api/v1
 */
const getApiUrl = (): string => {
  // Try multiple sources for the API URL
  // Priority: 1. app.config.js extra, 2. process.env (Expo auto-loads EXPO_PUBLIC_*)
  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && (window as any).__API_URL__);

  // Debug logging
  console.log('[API Config Debug]', {
    fromExtra: Constants.expoConfig?.extra?.apiUrl,
    fromProcessEnv: process.env.EXPO_PUBLIC_API_URL,
    finalUrl: apiUrl,
  });

  if (apiUrl) {
    // Log for debugging
    console.log('[API Config] Using API URL:', apiUrl);
    return apiUrl;
  }

  // Fallback - warn but don't crash
  const defaultUrl = 'http://localhost:8081/api/v1';
  console.warn(
    `[API Config] EXPO_PUBLIC_API_URL is not set.\n` +
      `Using default: ${defaultUrl}\n` +
      `Note: For physical devices/emulators, use your machine's IP address.\n` +
      `Example: http://192.168.1.100:8081/api/v1\n` +
      `Add EXPO_PUBLIC_API_URL to your .env file.`
  );
  return defaultUrl;
};

/**
 * Get API base URL (lazy-loaded to avoid errors during module initialization)
 */
let cachedApiUrl: string | null = null;
const getCachedApiUrl = (): string => {
  if (!cachedApiUrl) {
    try {
      const url = getApiUrl();
      // Ensure no trailing slash to avoid double slashes in URLs
      cachedApiUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    } catch (error) {
      // If error occurs, use default
      console.warn('Error getting API URL, using default:', error);
      cachedApiUrl = 'http://localhost:8081/api/v1';
    }
  }
  return cachedApiUrl;
};

/**
 * Axios instance configured for the LifeCare API
 * baseURL is set dynamically to avoid initialization errors
 */
export const api: AxiosInstance = axios.create({
  baseURL: getCachedApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor to add auth token and language header to requests
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Ensure baseURL is set (fallback)
    if (!config.baseURL) {
      config.baseURL = getCachedApiUrl();
    }

    // Log request in development for debugging
    if (__DEV__ && config.url) {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    }

    // Get token from AsyncStorage if not already set in headers
    if (!config.headers.Authorization) {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API] Token added to request:', token.substring(0, 20) + '...');
        } else {
          console.warn('[API] No token found in storage for request:', config.url);
        }
      } catch (error) {
        // Silently fail if AsyncStorage is unavailable
        console.warn('Failed to get auth token from storage:', error);
      }
    } else {
      console.log('[API] Using existing Authorization header');
    }

    // Add language header if not already set (x-language is used by backend i18n)
    if (!config.headers['x-language']) {
      try {
        const language = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (language) {
          config.headers['x-language'] = language;
        } else {
          // Default to English if no language is set
          config.headers['x-language'] = 'en';
        }
      } catch (error) {
        // Silently fail and use default language
        config.headers['x-language'] = 'en';
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (_e) {
    // ignore
  }
  delete api.defaults.headers.common['Authorization'];
}

/**
 * Response interceptor: on 401 try refresh once; if refresh fails, clear session and notify app to logout.
 */
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean };
    if (error.response) {
      const status = error.response.status;
      const isAuthEndpoint = config?.url?.includes('/auth/');

      // 401: try token refresh for protected endpoints; if refresh fails or endpoint is auth, logout immediately
      if (status === 401) {
        if (isAuthEndpoint) {
          await clearSession();
          sessionExpiredCallback?.();
          return Promise.reject(error);
        }
        if (config?._retriedAfterRefresh) {
          await clearSession();
          sessionExpiredCallback?.();
          return Promise.reject(error);
        }
        try {
          const { AuthService } = await import('./auth.service');
          const refreshResult = await AuthService.refreshToken();
          if (refreshResult.ok && refreshResult.data && (refreshResult.data as any).accessToken) {
            const newToken = (refreshResult.data as any).accessToken;
            config._retriedAfterRefresh = true;
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newToken}`;
            return api.request(config);
          }
        } catch (_refreshError) {
          // Refresh failed
        }
        await clearSession();
        sessionExpiredCallback?.();
        return Promise.reject(error);
      }

      // Define which errors are expected and should be handled gracefully (no console.error)
      const isExpectedError =
        (status === 401 && isAuthEndpoint) ||
        (status === 400 && isAuthEndpoint) ||
        status === 429 ||
        status === 409;
      if (!isExpectedError && __DEV__) {
        console.error('API Error:', {
          status: error.response.status,
          url: config?.url,
          baseURL: config?.baseURL,
          data: error.response.data,
        });
      }

      switch (status) {
        case 404:
          if (__DEV__ && !isAuthEndpoint) {
            console.error(
              `404 Error: Endpoint not found.\n` +
                `Requested: ${config?.method?.toUpperCase()} ${config?.baseURL}${config?.url}`
            );
          }
          break;
        case 429:
        case 500:
          break;
      }
    } else if (error.request) {
      if (__DEV__) {
        console.error('Network error - no response received:', {
          url: config?.url,
          baseURL: config?.baseURL,
        });
      }
    } else if (__DEV__) {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}

export default api;
