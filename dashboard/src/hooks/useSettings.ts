import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  gender: string;
  nid?: string | null;
  profilePicture: string | null;
  country: string | null;
  city: string | null;
  preferredLanguage?: string;
  latitude?: number | null;
  longitude?: number | null;
  verificationStatus: string;
  isEmailVerified: boolean;
  isAccountSuspended: boolean;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  doctorProfile?: unknown | null;
  patientProfile?: unknown | null;
  pharmacistProfile?: unknown | null;
  labStaffProfile?: unknown | null;
  availableRoles?: UserRole[];
  canSwitchRole?: boolean;
}

interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  city?: string;
  gender?: string;
  country?: string;
}

export function useSettings() {
  const queryClient = useQueryClient();

  // Fetch user profile from /auth/me
  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await authApi.getMe();
      if (!response.data?.ok || response.data?.data === undefined) {
        throw new Error((response.data as { message?: string })?.message || 'Failed to load profile');
      }
      return response.data.data as unknown as UserProfile;
    },
  });

  // Update profile mutation (PATCH /auth/me)
  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await authApi.updateMe(data);
      if (!response.data?.ok) {
        throw new Error((response.data as { message?: string })?.message || 'Failed to update profile');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    },
  });

  // Change password mutation (POST /auth/change-password)
  const changePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const response = await authApi.changePassword(currentPassword, newPassword);
      if (!response.data?.ok) {
        throw new Error((response.data as { message?: string })?.message || 'Failed to change password');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to change password');
    },
  });

  return {
    userProfile,
    isLoading,
    error,
    refetch,
    updateProfile,
    changePassword,
  };
}
