import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    doctors: number;
    pharmacists: number;
    labStaff: number;
  };
}

export interface CreateHospitalDto {
  name: string;
  address: string;
  city: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
}

export interface UpdateHospitalDto {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
}

export const useHospitals = () => {
  const queryClient = useQueryClient();

  const {
    data: hospitals = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: Hospital[] }>('/hospitals');
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch hospitals');
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  const createHospital = useMutation({
    mutationFn: (data: CreateHospitalDto) => apiClient.post('/hospitals', data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success(response.data.message || 'Hospital created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create hospital');
    },
  });

  const updateHospital = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHospitalDto }) =>
      apiClient.patch(`/hospitals/${id}`, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success(response.data.message || 'Hospital updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    },
  });

  const deleteHospital = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/hospitals/${id}`),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success(response.data.message || 'Hospital deleted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete hospital');
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch(`/hospitals/${id}/toggle-active`, { active }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success(response.data.message || 'Hospital status updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update hospital status');
    },
  });

  return {
    hospitals,
    loading,
    error,
    refetch,
    createHospital,
    updateHospital,
    deleteHospital,
    toggleActive,
  };
};
