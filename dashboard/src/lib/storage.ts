import { logError } from './utils';

// Token storage using localStorage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    logError(error, 'Storage: getToken');
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    logError(error, 'Storage: getRefreshToken');
    return null;
  }
};

export const getUser = (): IAuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logError(error, 'Storage: getUser');
    return null;
  }
};

export const setToken = (token: string, expiresIn?: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    // Store token expiry time if provided (expiresIn is in seconds)
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  } catch (error) {
    logError(error, 'Storage: setToken');
  }
};

export const getTokenExpiry = (): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  } catch (error) {
    logError(error, 'Storage: getTokenExpiry');
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  // Check if token will expire in the next 5 minutes (300000ms)
  // This gives us time to refresh before actual expiry
  return Date.now() >= expiry - 300000;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    logError(error, 'Storage: setRefreshToken');
  }
};

export const setUser = (user: IAuthUser): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    logError(error, 'Storage: setUser');
  }
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    logError(error, 'Storage: removeToken');
  }
};
