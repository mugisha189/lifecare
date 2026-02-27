import api, { ApiResponse } from './api';
import {
  User,
  UpdateProfileDto,
} from '../types/user.types';

/**
 * Doctor profile creation data
 */
export interface DoctorProfileData {
  licenseNumber: string;
  licenseExpiryDate: string; // ISO date string
  specialization: string;
  qualifications?: string[];
  yearsOfExperience?: number;
  bio?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hospitalId?: string;
  documents: {
    documentType: 'MEDICAL_LICENSE' | 'NATIONAL_ID' | 'MEDICAL_CERTIFICATE' | 'OTHER';
    documentURL: string;
    expiryDate?: string;
  }[];
}

/**
 * Patient profile creation data
 */
export interface PatientProfileData {
  dateOfBirth?: string; // ISO date string
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProviderId?: string;
  insuranceNumber?: string;
  medicalHistory?: string[];
  allergies?: string[];
  chronicConditions?: string[];
}

/**
 * Pharmacist profile creation data
 */
export interface PharmacistProfileData {
  licenseNumber: string;
  licenseExpiryDate: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  documents: {
    documentType: 'PHARMACY_LICENSE' | 'NATIONAL_ID' | 'OTHER';
    documentURL: string;
    expiryDate?: string;
  }[];
}

/**
 * Lab Staff profile creation data
 */
export interface LabStaffProfileData {
  licenseNumber: string;
  licenseExpiryDate: string;
  specialization?: string;
  hospitalId?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  documents: {
    documentType: 'LAB_LICENSE' | 'NATIONAL_ID' | 'OTHER';
    documentURL: string;
    expiryDate?: string;
  }[];
}

/**
 * Profile service for handling profile completion
 */
export class ProfileService {
  /**
   * Create doctor profile
   */
  static async createDoctorProfile(data: DoctorProfileData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/doctor-profiles/create-my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to create doctor profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error creating doctor profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to create doctor profile',
      };
    }
  }

  /**
   * Create patient profile
   */
  static async createPatientProfile(data: PatientProfileData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/patient-profiles/create-my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to create patient profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error creating patient profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to create patient profile',
      };
    }
  }

  /**
   * Create pharmacist profile
   */
  static async createPharmacistProfile(data: PharmacistProfileData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/pharmacist-profiles/create-my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to create pharmacist profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error creating pharmacist profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to create pharmacist profile',
      };
    }
  }

  /**
   * Create lab staff profile
   */
  static async createLabStaffProfile(data: LabStaffProfileData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/lab-staff-profiles/create-my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to create lab staff profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error creating lab staff profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to create lab staff profile',
      };
    }
  }

  /**
   * Check if user has completed their profile
   */
  static async checkProfileCompletion(): Promise<
    ApiResponse<{ hasProfile: boolean; roleName: string }>
  > {
    try {
      const response = await api.get<ApiResponse>('/auth/me');

      if (response.data.ok && response.data.data) {
        const user = response.data.data;
        const roleName = user.role?.name;
        let hasProfile = false;

        // Check based on role
        if (roleName === 'DOCTOR') {
          hasProfile = !!user.doctorProfile;
        } else if (roleName === 'PATIENT') {
          hasProfile = !!user.patientProfile;
        } else if (roleName === 'PHARMACIST') {
          hasProfile = !!user.pharmacistProfile;
        } else if (roleName === 'LABORATORY_STAFF') {
          hasProfile = !!user.labStaffProfile;
        }

        return {
          ok: true,
          message: 'Profile check successful',
          data: {
            hasProfile,
            roleName,
          },
        };
      }

      return {
        ok: false,
        message: 'Failed to check profile completion',
      };
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Failed to check profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error checking profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to check profile',
      };
    }
  }

  /**
   * Get current user profile
   */
  static async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      console.log('[ProfileService] Getting user profile...');
      console.log('[ProfileService] API baseURL:', api.defaults.baseURL);
      console.log('[ProfileService] API headers:', api.defaults.headers.common);

      const response = await api.get<ApiResponse<User>>('/auth/me');

      console.log('[ProfileService] Response status:', response.status);
      console.log('[ProfileService] Response data:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Error getting profile:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers,
      });

      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Failed to get profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error getting profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to get profile',
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(data: UpdateProfileDto): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch<ApiResponse<User>>('/auth/me', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Failed to update profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error updating profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  /**
   * Update doctor profile
   */
  static async updateDoctorProfile(data: any): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>('/doctor-profiles/my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to update doctor profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error updating doctor profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to update doctor profile',
      };
    }
  }

  /**
   * Update patient profile
   */
  static async updatePatientProfile(data: any): Promise<ApiResponse> {
    try {
      const response = await api.patch<ApiResponse>('/patient-profiles/my-profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.message || errorData.error || 'Failed to update patient profile';
        return {
          ok: false,
          message: errorMessage,
        };
      }

      if (__DEV__ && !error.response) {
        console.warn('Network or unexpected error updating patient profile:', error.message);
      }

      return {
        ok: false,
        message: error.message || 'Failed to update patient profile',
      };
    }
  }
}
