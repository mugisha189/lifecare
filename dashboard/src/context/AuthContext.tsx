import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { setToken, setRefreshToken, removeToken, getUser, setUser as setStoredUser } from '@/lib/storage';
import React, { createContext, useState } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext<IAuthContext>({
  user: null,
  setUser: () => {},
  isLoading: true,
  isAuthenticating: false,
  login: null,
  logout: () => {},
  isAuthenticated: false,
  googleLogin: null,
});

export { AuthContext };

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check auth synchronously to avoid loading flash
  const initialUser = typeof window !== 'undefined' ? getUser() : null;
  const [user, setUser] = useState<IAuthUser | null>(initialUser);

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/auth/login';
  };

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message ?? 'Login failed');
    },
    onSuccess: data => {
      const responseData = (data?.data as LoginResponse | undefined)?.data;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;
      const expiresIn = responseData?.expiresIn;
      const apiUser = responseData?.user;

      if (accessToken && refreshToken && apiUser) {
        setToken(accessToken, expiresIn);
        setRefreshToken(refreshToken);

        const userData: IAuthUser = {
          email: apiUser.email,
          name: apiUser.name,
          role: apiUser.role.name,
        };
        setStoredUser(userData);
        setUser(userData);

        toast.success('Login successful.');
        // Profiles for doctors, pharmacists, and lab staff are now created
        // at the time the user account is created, so we can always
        // send authenticated users directly to the dashboard.
        window.location.href = '/dashboard';
      } else {
        toast.error('Login failed: Invalid response data');
      }
    },
  });

  const googleLogin = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.googleLogin(email),
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message ?? 'Google login failed');
    },
    onSuccess: data => {
      const responseData = (data?.data as LoginResponse | undefined)?.data;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;
      const expiresIn = responseData?.expiresIn;
      const apiUser = responseData?.user;

      if (accessToken && refreshToken && apiUser) {
        setToken(accessToken, expiresIn);
        setRefreshToken(refreshToken);

        const userData: IAuthUser = {
          email: apiUser.email,
          name: apiUser.name,
          role: apiUser.role.name,
        };
        setStoredUser(userData);
        setUser(userData);

        toast.success('Google login successful.');
        window.location.href = '/dashboard';
      } else {
        toast.error('Google login failed: Invalid response data');
      }
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading: false, // No longer needed - auth check is synchronous
        isAuthenticating: login.isPending || googleLogin.isPending,
        login,
        logout,
        isAuthenticated: !!user,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
