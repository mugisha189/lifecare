import api from './api';

export interface Consultation {
  id: string;
  code?: string;
  doctorId: string;
  patientId: string;
  scheduledAt?: string;
  date?: string;
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  clinicalNotes?: string;
  notes?: string;
  hospitalId?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    user: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      profilePicture?: string;
    };
    specialization?: string;
    licenseNumber?: string;
    hospital?: {
      id: string;
      name: string;
      address?: string;
    };
  };
  patient?: {
    user: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
    };
  };
  hospital?: {
    id: string;
    name: string;
    address?: string;
  };
  labTests?: LabTestSummary[];
}

export interface LabTestSummary {
  id: string;
  testName: string;
  testType?: string;
  status: string;
  results?: Record<string, string | number>;
  resultsDate?: string;
  labTestType?: {
    id: string;
    name: string;
    questions?: Array<{ id: string; label: string; type: string }>;
  };
}

export interface CreateConsultationData {
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration?: number;
}

export interface QueryConsultationsParams {
  page?: number;
  limit?: number;
  status?: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  doctorId?: string;
  patientId?: string;
}

export interface ConsultationsResponse {
  ok: boolean;
  data: Consultation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ConsultationResponse {
  ok: boolean;
  data: Consultation;
  message?: string;
}

class ConsultationsService {
  /**
   * Book a consultation (Patient creates) via POST /consultations/book
   */
  async bookConsultation(data: CreateConsultationData): Promise<ConsultationResponse> {
    try {
      const response = await api.post<ConsultationResponse>('/consultations/book', {
        doctorId: data.doctorId,
        date: data.scheduledAt,
        duration: data.duration ?? 30,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error booking consultation:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to book consultation',
        data: {} as Consultation,
      };
    }
  }

  /**
   * Get consultations for current user (Patient)
   */
  async getMyConsultations(params?: QueryConsultationsParams): Promise<ConsultationsResponse> {
    try {
      const response = await api.get<ConsultationsResponse>('/consultations/patient-consultations', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error getting my consultations:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load consultations',
        data: [],
      };
    }
  }

  /**
   * Get consultations for doctor
   */
  async getDoctorConsultations(params?: QueryConsultationsParams): Promise<ConsultationsResponse> {
    try {
      const response = await api.get<ConsultationsResponse>('/consultations/doctor/consultations', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error getting doctor consultations:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load consultations',
        data: [],
      };
    }
  }

  /**
   * Get consultation by ID
   */
  async getConsultationById(id: string): Promise<ConsultationResponse> {
    try {
      const response = await api.get<ConsultationResponse>(`/consultations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error getting consultation:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to load consultation',
        data: {} as Consultation,
      };
    }
  }

  /**
   * Update consultation status (Doctor)
   */
  async updateStatus(
    id: string,
    status: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED',
    notes?: string
  ): Promise<ConsultationResponse> {
    try {
      const response = await api.patch<ConsultationResponse>(`/consultations/${id}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error updating consultation status:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to update consultation',
        data: {} as Consultation,
      };
    }
  }

  /**
   * Cancel consultation
   */
  async cancelConsultation(id: string, cancellationReason?: string): Promise<ConsultationResponse> {
    try {
      const response = await api.post<ConsultationResponse>(`/consultations/${id}/cancel`, {
        cancellationReason,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error cancelling consultation:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to cancel consultation',
        data: {} as Consultation,
      };
    }
  }

  /**
   * Search consultations (for finding available doctors)
   */
  async searchConsultations(params: QueryConsultationsParams): Promise<ConsultationsResponse> {
    try {
      const response = await api.get<ConsultationsResponse>('/consultations', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('[ConsultationsService] Error searching consultations:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to search consultations',
        data: [],
      };
    }
  }
}

export default new ConsultationsService();
