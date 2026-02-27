import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

export interface InsuranceProvider {
  id: string;
  name: string;
  contactInfo?: string;
  coverageDetails?: string;
  patientDividendPercent: number;
  insuranceDividendPercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    patients: number;
  };
}

export interface CreateInsuranceProviderDto {
  name: string;
  contactInfo?: string;
  coverageDetails?: string;
  patientDividendPercent: number;
  insuranceDividendPercent: number;
}

export interface UpdateInsuranceProviderDto {
  name?: string;
  contactInfo?: string;
  coverageDetails?: string;
  patientDividendPercent?: number;
  insuranceDividendPercent?: number;
}

export const useInsuranceProviders = () => {
  const queryClient = useQueryClient();

  const {
    data: insuranceProviders = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: async () => {
      const response = await apiClient.get<{
        ok: boolean;
        data: { insuranceProviders: InsuranceProvider[] };
      }>('/insurance-providers', {
        params: { limit: 100 },
      });
      if (response.data.ok && response.data.data?.insuranceProviders) {
        return response.data.data.insuranceProviders;
      }
      throw new Error('Failed to fetch insurance providers');
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  const createInsuranceProvider = useMutation({
    mutationFn: (data: CreateInsuranceProviderDto) =>
      apiClient.post('/insurance-providers', data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['insurance-providers'] });
      toast.success(response.data.message || 'Insurance provider created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create insurance provider');
    },
  });

  const updateInsuranceProvider = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInsuranceProviderDto }) =>
      apiClient.patch(`/insurance-providers/${id}`, data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['insurance-providers'] });
      toast.success(response.data.message || 'Insurance provider updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update insurance provider');
    },
  });

  const deleteInsuranceProvider = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/insurance-providers/${id}`),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['insurance-providers'] });
      toast.success(response.data.message || 'Insurance provider deleted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete insurance provider');
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch(`/insurance-providers/${id}/toggle-active`, { active }),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['insurance-providers'] });
      toast.success(response.data.message || 'Insurance provider status updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update insurance provider status');
    },
  });

  return {
    insuranceProviders,
    loading,
    error,
    refetch,
    createInsuranceProvider,
    updateInsuranceProvider,
    deleteInsuranceProvider,
    toggleActive,
  };
};
