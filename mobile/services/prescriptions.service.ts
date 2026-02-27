import api from './api';

export interface PrescriptionMedicine {
  id: string;
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  medicine?: {
    id: string;
    name: string;
    form: string;
    strength?: string;
  };
}

export interface Prescription {
  id: string;
  consultationId: string;
  doctorId: string;
  patientId: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
  updatedAt: string;
  medicines: PrescriptionMedicine[];
  doctor?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    specialization?: string;
  };
  patient?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  consultation?: {
    id: string;
    code?: string;
    date?: string;
    scheduledAt?: string;
    status?: string;
    reason?: string;
  };
}

export interface CreatePrescriptionData {
  consultationId: string;
  patientId: string;
  medicines: Array<{
    medicineId: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  notes?: string;
}

export interface QueryPrescriptionsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'DISPENSED' | 'CANCELLED';
}

export interface PrescriptionsResponse {
  ok: boolean;
  data: Prescription[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface PrescriptionResponse {
  ok: boolean;
  data: Prescription;
  message?: string;
}

class PrescriptionsService {
  /**
   * Create prescription (Doctor only)
   */
  async createPrescription(data: CreatePrescriptionData): Promise<PrescriptionResponse> {
    try {
      const response = await api.post<PrescriptionResponse>('/prescriptions', data);
      return response.data;
    } catch (error: any) {
      console.error('[PrescriptionsService] Error creating prescription:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to create prescription',
        data: {} as Prescription,
      };
    }
  }

  /**
   * Get prescriptions for current user (Patient).
   * Backend returns { ok, data: { prescriptions, pagination } }.
   */
  async getMyPrescriptions(params?: QueryPrescriptionsParams): Promise<PrescriptionsResponse> {
    try {
      const response = await api.get<{ ok: boolean; data?: { prescriptions?: Prescription[]; pagination?: unknown }; message?: string }>('/prescriptions', {
        params: { ...params, limit: params?.limit ?? 100 },
      });
      const payload = response.data;
      if (payload?.ok && payload.data) {
        const list = Array.isArray(payload.data.prescriptions) ? payload.data.prescriptions : [];
        return {
          ok: true,
          data: list,
          pagination: payload.data.pagination as PrescriptionsResponse['pagination'],
        };
      }
      return {
        ok: false,
        message: (payload as PrescriptionsResponse)?.message || 'Failed to load prescriptions',
        data: [],
      };
    } catch (error: any) {
      console.error('[PrescriptionsService] Error getting my prescriptions:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load prescriptions',
        data: [],
      };
    }
  }

  /**
   * Get prescriptions for doctor
   */
  async getDoctorPrescriptions(params?: QueryPrescriptionsParams): Promise<PrescriptionsResponse> {
    try {
      const response = await api.get<PrescriptionsResponse>('/prescriptions/doctor/prescriptions', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('[PrescriptionsService] Error getting doctor prescriptions:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load prescriptions',
        data: [],
      };
    }
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(id: string): Promise<PrescriptionResponse> {
    try {
      const response = await api.get<PrescriptionResponse>(`/prescriptions/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('[PrescriptionsService] Error getting prescription:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load prescription',
        data: {} as Prescription,
      };
    }
  }

  /**
   * Update prescription status (Pharmacist)
   */
  async updateStatus(
    id: string,
    status: 'PENDING' | 'DISPENSED' | 'CANCELLED'
  ): Promise<PrescriptionResponse> {
    try {
      const response = await api.patch<PrescriptionResponse>(`/prescriptions/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      console.error('[PrescriptionsService] Error updating prescription status:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to update prescription',
        data: {} as Prescription,
      };
    }
  }
}

export default new PrescriptionsService();
