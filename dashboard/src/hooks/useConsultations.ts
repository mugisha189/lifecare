import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { consultationsApi, type Consultation, type ConsultationFilters } from '@/lib/api';
import { toast } from 'sonner';
import type { AxiosResponse } from 'axios';

export interface UseConsultationsReturn {
  consultations: Consultation[];
  pagination: PaginationMeta | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateConsultation: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { id: string; data: Partial<Consultation> }
  >;
  deleteConsultation: UseMutationResult<AxiosResponse<ApiResponse>, AxiosError<ErrorResponse>, string>;
  cancelConsultation: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { id: string; reason: string }
  >;
  updateConsultationStatus: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { id: string; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }
  >;
}

export const useConsultations = (filters?: ConsultationFilters, useMyConsultations = false): UseConsultationsReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['consultations', filters, useMyConsultations],
    queryFn: async () => {
      if (useMyConsultations) {
        const response = await consultationsApi.getMyConsultations({
          status: filters?.status,
          page: filters?.page,
          limit: filters?.limit,
          hospitalId: filters?.hospitalId,
        });
        return response.data;
      }
      const response = await consultationsApi.getAll(filters);
      return response.data;
    },
    enabled: true,
  });

  const rawData = data?.data;
  const consultations = Array.isArray(rawData) ? rawData : (rawData as { consultations?: Consultation[] })?.consultations || [];
  const pagination = data?.pagination ?? (rawData as { pagination?: PaginationMeta })?.pagination;

  const updateConsultation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Consultation> }) => {
      return await consultationsApi.update(id, {
        scheduledAt: data.scheduledAt,
        reason: data.reason,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update consultation');
    },
  });

  const deleteConsultation = useMutation({
    mutationFn: async (id: string) => {
      return await consultationsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to delete consultation');
    },
  });

  const cancelConsultation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await consultationsApi.cancel(id, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation cancelled successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to cancel consultation');
    },
  });

  const updateConsultationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }) => {
      return await consultationsApi.updateStatus(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation status updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update consultation status');
    },
  });

  return {
    consultations,
    pagination,
    loading: isLoading,
    error: error ? (error as AxiosError<ErrorResponse>).response?.data?.message || 'Failed to fetch consultations' : null,
    refetch: () => {
      refetch();
    },
    updateConsultation,
    deleteConsultation,
    cancelConsultation,
    updateConsultationStatus,
  };
};
