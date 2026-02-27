import { IUser } from '../store/types';

/**
 * Backend user response type
 */
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  nid?: string | null;
  profilePicture?: string | null;
  country?: string | null;
  city?: string | null;
  preferredLanguage: string;
  latitude?: number | null;
  longitude?: number | null;
  verificationStatus: string;
  isEmailVerified: boolean;
  lastLogin?: string | null;
  isAccountSuspended: boolean;
  active: boolean;
  chatUid?: string | null;
  notificationPlayerId?: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description?: string | null;
  };
  doctorProfile?: any;
  patientProfile?: any;
  pharmacistProfile?: any;
  labStaffProfile?: any;
}

/**
 * Map backend user response to frontend IUser format
 * This handles the differences between backend (UUID strings) and frontend (numbers) expectations
 */
export function mapBackendUserToFrontend(backendUser: BackendUser): IUser {
  // Convert string ID to number for compatibility (assuming IDs can be converted)
  const userIdNum = parseInt(backendUser.id.replace(/-/g, '').slice(0, 10), 16) % 2147483647;
  const roleIdNum = parseInt(backendUser.role.id.replace(/-/g, '').slice(0, 10), 16) % 2147483647;
  
  return {
    // Map id to userId
    userId: userIdNum,
    id: backendUser.id, // Add string id property
    roleId: roleIdNum,
    name: backendUser.name,
    email: backendUser.email,
    phoneNumber: backendUser.phoneNumber,
    passwordHash: '', // Never include password hash in frontend
    gender: backendUser.gender,
    nid: backendUser.nid || null,
    documentId: null, // Not in backend response
    profilePicture: backendUser.profilePicture || null,
    country: backendUser.country || null,
    city: backendUser.city || null,
    preferredLanguage: 'en' as any, // Default to English (removed from backend but kept for type compatibility)
    latitude: null, // Removed from healthcare schema
    longitude: null, // Removed from healthcare schema
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    // Updated to use patientProfile instead of passengerProfile
    passengerRecordId: backendUser.patientProfile?.id || null,
    notificationPlayerId: backendUser.notificationPlayerId || null,
    verificationExpires: null, // Not in backend response
    verificationStatus: backendUser.verificationStatus,
    passwordResetCode: null, // Never include in response
    passwordResetExpires: null, // Never include in response
    passwordSetCode: '', // Never include in response
    passwordSetCodeExpires: '', // Never include in response
    isEmailVerified: backendUser.isEmailVerified,
    emailVerificationCode: null, // Never include in response
    emailVerificationExpiry: null, // Never include in response
    passwordResetExpiry: null, // Never include in response
    loginCodeMFA: '', // Never include in response
    chatUid: backendUser.chatUid || '',
    mfaCodeExpires: '', // Never include in response
    lastLogin: backendUser.lastLogin || '',
    isAccountSuspended: backendUser.isAccountSuspended,
    // Updated to use doctorProfile instead of driverProfile
    driverRecord: backendUser.doctorProfile
      ? {
          driverRecordId: backendUser.doctorProfile.id as any,
          driverLicenseNumber: backendUser.doctorProfile.licenseNumber as any,
          hasUploadedDocuments: true, // Simplified for healthcare
          areDocumentsVerified: backendUser.doctorProfile.verificationStatus === 'VERIFIED',
          userId: backendUser.id as any,
          createdAt: backendUser.doctorProfile.createdAt,
          updatedAt: backendUser.doctorProfile.updatedAt,
        }
      : null,
    corporateAccount: null, // No longer used in healthcare
    accountSwitches: [], // Not in backend response
    bookings: [], // Not in backend response
    notifications: [], // Not in backend response
    dashboard: null, // Not in backend response
    currentRole: {
      roleId: backendUser.role.id as any,
      name: backendUser.role.name,
      description: backendUser.role.description || '',
      createdAt: '',
      updatedAt: '',
    },
    devices: [], // Not in backend response
  };
}
