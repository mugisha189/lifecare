import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { getToken, removeToken, getRefreshToken, setToken, setRefreshToken, isTokenExpired } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-language': 'en',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      if (prom.config.headers) {
        prom.config.headers.Authorization = `Bearer ${token}`;
      }
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};

// Add Bearer token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// Handle responses and token refresh
apiClient.interceptors.response.use(
  response => {
    // Update token from response if present
    const newAccessToken = response.data?.data?.accessToken;
    const newRefreshToken = response.data?.data?.refreshToken;
    const expiresIn = response.data?.data?.expiresIn;

    if (newAccessToken) {
      setToken(newAccessToken, expiresIn);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request to be retried after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        removeToken();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;
        const expiresIn = response.data?.data?.expiresIn;

        if (!newAccessToken || !newRefreshToken) {
          throw new Error('Invalid refresh response');
        }

        // Update tokens
        setToken(newAccessToken, expiresIn);
        setRefreshToken(newRefreshToken);

        // Process all queued requests with new token
        processQueue(null, newAccessToken);

        // DON'T retry the original request that failed
        // Just reject it so the UI can handle the 401 gracefully
        return Promise.reject(error);
      } catch (refreshError) {
        // Refresh failed - logout user and reject all queued requests
        processQueue(refreshError, null);
        removeToken();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
