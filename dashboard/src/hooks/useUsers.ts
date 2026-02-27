import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

// User type based on API response
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | string;
  profilePicture: string | null;
  country: string;
  city: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | string;
  isEmailVerified: boolean;
  isAccountSuspended: boolean;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
}

export interface CreateUserDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  roleId: string;
  gender?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  country?: string;
  city?: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Fetch users with useQuery
  const {
    data: users = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getUsers();
      if (response.data.ok && response.data.data) {
        return response.data.data as unknown as User[];
      }
      throw new Error(response.data.message || 'Failed to fetch users');
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDto) => userApi.createUser(data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User created successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => userApi.updateUser(id, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // Activate/Deactivate user mutation
  const activateUserMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => userApi.activateUser(id, { active }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User status updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: ({ id, reason, suspendedUntil }: { id: string; reason?: string; suspendedUntil?: string }) =>
      userApi.suspendUser(id, { reason, suspendedUntil }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User suspended successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    },
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: (id: string) => userApi.unsuspendUser(id),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.data.message || 'User unsuspended successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to unsuspend user');
    },
  });

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: ({ userIds, message }: { userIds: string[]; message: string }) => userApi.sendSMS({ userIds, message }),
    onSuccess: response => {
      toast.success(response.data.message || 'SMS sent successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to send SMS');
    },
  });

  return {
    users,
    loading,
    error,
    refetch,
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    activateUser: activateUserMutation,
    suspendUser: suspendUserMutation,
    unsuspendUser: unsuspendUserMutation,
    sendSMS: sendSMSMutation,
  };
};

export const useUser = (id: string | null) => {
  const {
    data: user = null,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await userApi.getUserById(id);
      if (response.data.ok && response.data.data) {
        return response.data.data as unknown as User;
      }
      throw new Error(response.data.message || 'Failed to fetch user');
    },
    enabled: !!id,
  });

  const error = queryError ? (queryError as Error).message : null;

  return {
    user,
    loading,
    error,
    refetch,
  };
};
