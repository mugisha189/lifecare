/**
 * User and Profile Types
 * Based on the backend API response structure
 */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
export type DoctorStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'PENDING_APPROVAL';

/**
 * User role interface
 */
export interface UserRole {
  id: string;
  name: 'DOCTOR' | 'PATIENT' | 'PHARMACIST' | 'LABORATORY_STAFF' | 'ADMIN';
  description: string;
}

/**
 * Doctor profile interface
 */
export interface DoctorProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  specialization: string;
  qualifications: string[];
  yearsOfExperience: number | null;
  bio: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  doctorStatus: DoctorStatus;
  verificationStatus: VerificationStatus;
  hospitalId: string | null;
  averageRating: number;
  totalConsultations: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Patient profile interface
 */
export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  bloodType: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  insuranceProviderId: string | null;
  insuranceNumber: string | null;
  medicalHistory: string[];
  allergies: string[];
  chronicConditions: string[];
  totalConsultations: number;
  totalPrescriptions: number;
  createdAt: string;
  updatedAt: string;
  insuranceProvider?: {
    id: string;
    name: string;
  };
}

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  nid: string | null;
  profilePicture: string | null;
  country: string | null;
  city: string | null;
  dateOfBirth: string | null;
  bloodType: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  verificationStatus: VerificationStatus;
  isEmailVerified: boolean;
  isAccountSuspended: boolean;
  active: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  doctorProfile: DoctorProfile | null;
  patientProfile: PatientProfile | null;
  pharmacistProfile: any | null;
  labStaffProfile: any | null;
}

/**
 * Update profile DTO
 */
export interface UpdateProfileDto {
  name?: string;
  phoneNumber?: string;
  gender?: Gender;
  profilePicture?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  bloodType?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}
