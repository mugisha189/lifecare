import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { prescriptionsApi, type Prescription, type PrescriptionFilters } from '@/lib/api';
import { toast } from 'sonner';
import type { AxiosResponse } from 'axios';
import { useUserRole } from './useRole';

export interface UsePrescriptionsReturn {
  prescriptions: Prescription[];
  pagination: PaginationMeta | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updatePrescription: UseMutationResult<
    AxiosResponse<ApiResponse>,
    AxiosError<ErrorResponse>,
    { id: string; data: Partial<Prescription> }
  >;
  deletePrescription: UseMutationResult<AxiosResponse<ApiResponse>, AxiosError<ErrorResponse>, string>;
}

export const usePrescriptions = (filters?: PrescriptionFilters): UsePrescriptionsReturn => {
  const queryClient = useQueryClient();
  const userRole = useUserRole();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['prescriptions', filters, userRole],
    queryFn: async () => {
      // Use role-specific endpoint
      if (userRole === 'DOCTOR') {
        const response = await prescriptionsApi.getDoctorPrescriptions(filters);
        return response.data;
      } else if (userRole === 'PHARMACIST') {
        const response = await prescriptionsApi.getPharmacistPrescriptions(filters);
        return response.data;
      } else {
        // Admin - get all
        const response = await prescriptionsApi.getAll(filters);
        return response.data;
      }
    },
    enabled: true,
  });

  const prescriptions = (data?.data as { prescriptions?: Prescription[] })?.prescriptions || [];
  const pagination = (data?.data as { pagination?: PaginationMeta })?.pagination;

  const updatePrescription = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prescription> }) => {
      return await prescriptionsApi.update(id, {
        status: data.status,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Prescription updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update prescription');
    },
  });

  const deletePrescription = useMutation({
    mutationFn: async (id: string) => {
      return await prescriptionsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Prescription deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to delete prescription');
    },
  });

  return {
    prescriptions,
    pagination,
    loading: isLoading,
    error: error ? (error as AxiosError<ErrorResponse>).response?.data?.message || 'Failed to fetch prescriptions' : null,
    refetch: () => {
      refetch();
    },
    updatePrescription,
    deletePrescription,
  };
};
