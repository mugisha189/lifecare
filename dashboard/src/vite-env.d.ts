/// <reference types="vite/client" />

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SVG module declarations
declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// API response types
interface ApiResponse<T = Record<string, unknown>> {
  ok: boolean;
  message?: string;
  data: T;
}

interface ErrorResponse {
  message?: string;
}

interface AxiosErrorResponse {
  response?: {
    data?: ErrorResponse;
  };
  message?: string;
}

// Authentication types
interface LoginCredentials {
  email: string;
  password: string;
}

interface IAuthUser {
  email: string;
  name: string;
  role: string;
}

interface LoginResponseData {
  user: {
    id: string;
    roleId: string;
    name: string;
    email: string;
    phoneNumber: string;
    gender: string;
    nid: string | null;
    profilePicture: string | null;
    country: string;
    city: string;
    dateOfBirth?: string | null;
    bloodType?: string | null;
    verificationStatus: string;
    isEmailVerified: boolean;
    lastLogin: string;
    isAccountSuspended: boolean;
    active: boolean;
    chatUid: string | null;
    notificationPlayerId: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    role: {
      id: string;
      name: string;
      description: string;
    };
    doctorProfile?: { id: string } | null;
    pharmacistProfile?: { id: string } | null;
    labStaffProfile?: { id: string } | null;
    patientProfile?: { id: string } | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginResponse {
  ok: boolean;
  message: string;
  data: LoginResponseData;
}

// Auth context types
interface IAuthContext {
  user: IAuthUser | null;
  setUser: (user: IAuthUser | null) => void;
  isLoading: boolean;
  isAuthenticating: boolean;
  login:
    | import('@tanstack/react-query').UseMutationResult<
        import('axios').AxiosResponse<unknown>,
        import('axios').AxiosError<ErrorResponse>,
        { email: string; password: string },
        unknown
      >
    | null;
  logout: () => void;
  isAuthenticated: boolean;
  googleLogin:
    | import('@tanstack/react-query').UseMutationResult<
        import('axios').AxiosResponse<unknown>,
        import('axios').AxiosError<ErrorResponse>,
        { email: string },
        unknown
      >
    | null;
}

// Medicine types
interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: 'TABLET' | 'CAPSULE' | 'LIQUID' | 'INJECTION' | 'CREAM' | 'OTHER';
  stockQuantity: number;
  unitPrice: number;
  description?: string;
  manufacturer?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Consultation types
interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  reason: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  followUpRequired?: boolean;
  doctor?: {
    id: string;
    name: string;
    email: string;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Prescription types
interface Prescription {
  id: string;
  consultationId?: string;
  doctorId: string;
  patientId: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  medicines?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  doctor?: {
    id: string;
    name: string;
  };
  patient?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Lab Test types
interface LabTest {
  id: string;
  consultationId?: string;
  doctorId: string;
  patientId: string;
  requestedBy?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  testType: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Hospital types
interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}