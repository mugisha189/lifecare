import { SupportedLanguages } from '../translations';

/**
 * User role definitions
 */
export interface IRole {
  roleId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Driver record interface
 */
export interface IDriverRecord {
  driverRecordId: number;
  driverLicenseNumber: number;
  hasUploadedDocuments: boolean;
  areDocumentsVerified: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Account switch interface
 */
export interface IAccountSwitch {
  switchId: number;
  userId: number;
  fromRoleId: number;
  toRoleId: number;
  doneById: number | null;
  updatedAt: string;
  createdAt: string;
}

/**
 * Complete user interface
 */
export interface IUser {
  userId: number;
  id?: string; // Add optional string id for backend compatibility
  roleId: number;
  name: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  gender: string;
  nid: string | null;
  documentId: string | null;
  profilePicture: string | null;
  country: string | null;
  city: string | null;
  preferredLanguage: SupportedLanguages;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  passengerRecordId: number | null;
  notificationPlayerId: string | null;
  verificationExpires: string | null;
  verificationStatus: string;
  passwordResetCode: string | null;
  passwordResetExpires: string | null;
  passwordSetCode: string;
  passwordSetCodeExpires: string;
  isEmailVerified: boolean;
  emailVerificationCode: string | null;
  emailVerificationExpiry: string | null;
  passwordResetExpiry: string | null;
  loginCodeMFA: string;
  chatUid: string;
  mfaCodeExpires: string;
  lastLogin: string;
  isAccountSuspended: boolean;
  driverRecord: IDriverRecord | null;
  corporateAccount: any | null;
  accountSwitches: IAccountSwitch[];
  bookings: any[];
  notifications: any[];
  dashboard: any | null;
  currentRole: IRole | null;
  devices: any[];
}

/**
 * Coordinates interface for location tracking
 */
export interface ICoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location details for journeys
 */
export interface ILocationDetails {
  from?: {
    coordinates: ICoordinates;
  };
  to?: {
    coordinates: ICoordinates;
  };
}

/**
 * Base journey interface
 */
export interface IJourney {
  from: string;
  to: string;
  locationDetails?: ILocationDetails;
  passengers: number;
  pickupTime: Date | null;
  isScheduled: boolean;
  price: number;
  distance: number;
  duration: number;
}

/**
 * Extended journey interface for riders with additional preferences
 */
export interface IRiderJourney extends IJourney {
  maxDistance?: number; // max offset distance from departure point (in km)
  notificationPeriod?: number; // amount of hours the rider is willing to wait to find a ride
  earliestDepartureTime?: Date;
  latestDepartureTime?: Date;
}

/**
 * Signup step tracking
 */
export interface ISignupStep {
  step: number;
  completed: boolean;
}

/**
 * Auth state interface
 */
export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
