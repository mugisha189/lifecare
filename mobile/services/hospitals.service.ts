import api from './api';

export interface Hospital {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  active?: boolean;
}

export interface HospitalDoctor {
  id: string;
  userId: string;
  hospitalId: string;
  specialization?: string;
  licenseNumber?: string;
  doctorStatus: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
}

interface HospitalsResponse {
  ok: boolean;
  data: Hospital[];
  message?: string;
}

interface HospitalDoctorsResponse {
  ok: boolean;
  data: HospitalDoctor[];
  message?: string;
}

class HospitalsService {
  async getHospitals(): Promise<HospitalsResponse> {
    try {
      const response = await api.get<HospitalsResponse>('/hospitals');
      const data = response.data;
      return {
        ok: data.ok ?? true,
        data: Array.isArray(data.data) ? data.data : [],
        message: data.message,
      };
    } catch (error: any) {
      console.error('[HospitalsService] Error fetching hospitals:', error);
      return {
        ok: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load hospitals',
      };
    }
  }

  async getHospitalDoctors(hospitalId: string): Promise<HospitalDoctorsResponse> {
    try {
      const response = await api.get<HospitalDoctorsResponse>(`/hospitals/${hospitalId}/doctors`);
      const data = response.data;
      const list = data?.data;
      return {
        ok: data.ok ?? true,
        data: Array.isArray(list) ? list : [],
        message: data.message,
      };
    } catch (error: any) {
      console.error('[HospitalsService] Error fetching hospital doctors:', error);
      return {
        ok: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load doctors',
      };
    }
  }
}

export default new HospitalsService();
