import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { medicinesApi, type Medicine, type MedicineFilters } from '@/lib/api';
import { toast } from 'sonner';
import type { AxiosResponse } from 'axios';

export interface UseMedicinesReturn {
  medicines: Medicine[];
  pagination: PaginationMeta | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createMedicine: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { name: string; description?: string }
  >;
  updateMedicine: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { id: string; data: Partial<Medicine> }
  >;
  deleteMedicine: UseMutationResult<AxiosResponse<ApiResponse>, AxiosError<ErrorResponse>, string>;
}

export const useMedicines = (filters?: MedicineFilters): UseMedicinesReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['medicines', filters],
    queryFn: async () => {
      const response = await medicinesApi.getAll(filters);
      return response.data;
    },
    enabled: true,
  });

  const medicines = (data?.data as { medicines?: Medicine[] })?.medicines || [];
  const pagination = (data?.data as { pagination?: PaginationMeta })?.pagination;

  const createMedicine = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await medicinesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine created successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to create medicine');
    },
  });

  const updateMedicine = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Medicine> }) => {
      return await medicinesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update medicine');
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: async (id: string) => {
      return await medicinesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    },
  });

  return {
    medicines,
    pagination,
    loading: isLoading,
    error: error ? (error as AxiosError<ErrorResponse>).response?.data?.message || 'Failed to fetch medicines' : null,
    refetch: () => {
      refetch();
    },
    createMedicine,
    updateMedicine,
    deleteMedicine,
  };
};
