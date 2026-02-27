import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

export interface Pharmacy {
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
    pharmacists: number;
  };
}

export interface CreatePharmacyDto {
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

export interface UpdatePharmacyDto {
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

export const usePharmacies = () => {
  const queryClient = useQueryClient();

  const {
    data: pharmacies = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: Pharmacy[] }>('/pharmacies');
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pharmacies');
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  const createPharmacy = useMutation({
    mutationFn: (data: CreatePharmacyDto) => apiClient.post('/pharmacies', data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success(response.data.message || 'Pharmacy created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create pharmacy');
    },
  });

  const updatePharmacy = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePharmacyDto }) =>
      apiClient.patch(`/pharmacies/${id}`, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success(response.data.message || 'Pharmacy updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy');
    },
  });

  const deletePharmacy = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/pharmacies/${id}`),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success(response.data.message || 'Pharmacy deleted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete pharmacy');
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch(`/pharmacies/${id}/toggle-active`, { active }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      toast.success(response.data.message || 'Pharmacy status updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy status');
    },
  });

  return {
    pharmacies,
    loading,
    error,
    refetch,
    createPharmacy,
    updatePharmacy,
    deletePharmacy,
    toggleActive,
  };
};
