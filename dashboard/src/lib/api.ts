import apiClient from './apiClient';

export interface ApiResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
}

// TypeScript interfaces for data models
export interface DoctorProfileResponse {
  id: string;
  userId: string;
  specialization?: string;
  licenseNumber?: string;
  qualifications?: string[];
  bio?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
    active: boolean;
    isAccountSuspended: boolean;
    city?: string;
    country?: string;
  };
  hospital?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  doctorId: string;
  patientId: string;
  pharmacistId?: string;
  notes?: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  dispensedAt?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: DoctorProfileResponse;
  patient?: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  };
  medicines?: Array<{
    id: string;
    medicineId: string;
    dosage: string;
    quantity: number;
    frequency?: string;
    duration?: string;
    instructions?: string;
    medicine?: Medicine;
  }>;
}

export interface PrescriptionFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  duration?: number;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  doctor?: DoctorProfileResponse;
  patient?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  prescriptions?: Prescription[];
  _count?: {
    prescriptions: number;
    labTests: number;
  };
}

export interface ConsultationFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  hospitalId?: string;
  startDate?: string;
  endDate?: string;
}

export interface RoleUsage {
  role: string;
  count: number;
  percentage: number;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse>('/auth/login', { identifier: email, password }),
  googleLogin: (email: string) => apiClient.post<ApiResponse>('/auth/google-login', { email }),
  logout: () => apiClient.post<ApiResponse>('/auth/logout'),
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/auth/refresh', { refreshToken }),
  getMe: () => apiClient.get<ApiResponse>('/auth/me'),
  updateMe: (data: { name?: string; phoneNumber?: string; gender?: string; country?: string; city?: string; profilePicture?: string }) =>
    apiClient.patch<ApiResponse>('/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
};

// User API
export const userApi = {
  getAll: () => apiClient.get<ApiResponse>('/users'),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/users/${id}`),
  create: (data: any) => apiClient.post<ApiResponse>('/users', data),
  update: (id: string, data: any) => apiClient.patch<ApiResponse>(`/users/${id}`, data),
  updateUser: (id: string, data: any) => apiClient.patch<ApiResponse>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/users/${id}`),
  toggleActive: (id: string, active: boolean) =>
    apiClient.post<ApiResponse>(`/users/${id}/activate`, { active }),
  getRoles: () => apiClient.get<ApiResponse>('/users/roles/all'),
  search: (query?: string, role?: string, limit?: number) =>
    apiClient.get<ApiResponse>('/users/search', { params: { q: query, role, limit } }),
  suspend: (id: string, reason: string) =>
    apiClient.post<ApiResponse>(`/users/${id}/suspend`, { reason }),
  unsuspend: (id: string) => apiClient.post<ApiResponse>(`/users/${id}/unsuspend`),
  activate: (id: string) => apiClient.post<ApiResponse>(`/users/${id}/activate`),
  // Aliases for useUsers hook
  getUsers: () => apiClient.get<ApiResponse>('/users'),
  getUserById: (id: string) => apiClient.get<ApiResponse>(`/users/${id}`),
  createUser: (data: any) => apiClient.post<ApiResponse>('/users', data),
  deleteUser: (id: string) => apiClient.delete<ApiResponse>(`/users/${id}`),
  activateUser: (id: string, body: { active: boolean }) =>
    apiClient.post<ApiResponse>(`/users/${id}/activate`, body),
  suspendUser: (id: string, body: { reason?: string; suspendedUntil?: string }) =>
    apiClient.post<ApiResponse>(`/users/${id}/suspend`, body),
  sendSMS: (body: { userIds: string[]; message: string }) =>
    apiClient.post<ApiResponse>('/users/send-sms', body),
};

// Doctor Profiles API
export const doctorApi = {
  getDoctors: (params?: any) => apiClient.get<ApiResponse>('/doctor-profiles', { params }),
  getDoctor: (id: string) => apiClient.get<ApiResponse>(`/doctor-profiles/${id}`),
  createDoctor: (data: any) => apiClient.post<ApiResponse>('/doctor-profiles', data),
  updateDoctor: (id: string, data: any) => apiClient.patch<ApiResponse>(`/doctor-profiles/${id}`, data),
  deleteDoctor: (id: string) => apiClient.delete<ApiResponse>(`/doctor-profiles/${id}`),
  suspendDoctor: (id: string, reason: string) =>
    apiClient.post<ApiResponse>(`/users/${id}/suspend`, { reason }),
  unsuspendDoctor: (id: string) => apiClient.post<ApiResponse>(`/users/${id}/unsuspend`),
  verifyDoctor: (id: string) => apiClient.patch<ApiResponse>(`/doctor-profiles/${id}/verify`),
};

// Patient Profiles API
export const patientApi = {
  getPatients: (params?: any) => apiClient.get<ApiResponse>('/patient-profiles', { params }),
  getPatient: (id: string) => apiClient.get<ApiResponse>(`/patient-profiles/${id}`),
  createPatient: (data: any) => apiClient.post<ApiResponse>('/patient-profiles', data),
  updatePatient: (id: string, data: any) => apiClient.patch<ApiResponse>(`/patient-profiles/${id}`, data),
  deletePatient: (id: string) => apiClient.delete<ApiResponse>(`/patient-profiles/${id}`),
};

// Lab Staff Profiles API
export const labStaffApi = {
  getLabStaff: (params?: any) => apiClient.get<ApiResponse>('/lab-staff-profiles', { params }),
  getLabStaffMember: (id: string) => apiClient.get<ApiResponse>(`/lab-staff-profiles/${id}`),
  createLabStaff: (data: any) => apiClient.post<ApiResponse>('/lab-staff-profiles', data),
  updateLabStaff: (id: string, data: any) => apiClient.patch<ApiResponse>(`/lab-staff-profiles/${id}`, data),
  deleteLabStaff: (id: string) => apiClient.delete<ApiResponse>(`/lab-staff-profiles/${id}`),
};

// Pharmacist Profiles API
export const pharmacistApi = {
  getPharmacists: (params?: any) => apiClient.get<ApiResponse>('/pharmacist-profiles', { params }),
  getPharmacist: (id: string) => apiClient.get<ApiResponse>(`/pharmacist-profiles/${id}`),
  createPharmacist: (data: any) => apiClient.post<ApiResponse>('/pharmacist-profiles', data),
  updatePharmacist: (id: string, data: any) => apiClient.patch<ApiResponse>(`/pharmacist-profiles/${id}`, data),
  deletePharmacist: (id: string) => apiClient.delete<ApiResponse>(`/pharmacist-profiles/${id}`),
};

// Consultations API
export const consultationsApi = {
  getAll: (params?: any) => apiClient.get<ApiResponse>('/consultations', { params }),
  getMyConsultations: (params?: any) => apiClient.get<ApiResponse>('/consultations/my-consultations', { params }),
  getByCode: (code: string) => apiClient.get<ApiResponse>(`/consultations/by-code/${encodeURIComponent(code.trim())}`),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/consultations/${id}`),
  create: (data: any) => apiClient.post<ApiResponse>('/consultations', data),
  update: (id: string, data: any) => apiClient.patch<ApiResponse>(`/consultations/${id}`, data),
  updateStatus: (id: string, data: { status: string }) => apiClient.patch<ApiResponse>(`/consultations/${id}/status`, data),
  cancel: (id: string, data: { reason: string }) => apiClient.post<ApiResponse>(`/consultations/${id}/cancel`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/consultations/${id}`),
};

const uploadsBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');

export function getAttachmentUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${uploadsBaseUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export const consultationNotesApi = {
  getByConsultation: (consultationId: string) =>
    apiClient.get<ApiResponse>(`/consultation-notes/consultation/${consultationId}`),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<ApiResponse>('/consultation-notes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (data: {
    consultationId: string;
    content?: string;
    attachments?: Array<{ name: string; url: string; type: string; size?: number }>;
    parentNoteId?: string;
  }) => apiClient.post<ApiResponse>('/consultation-notes', data),
  update: (id: string, data: { content?: string; attachments?: any }) =>
    apiClient.patch<ApiResponse>(`/consultation-notes/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/consultation-notes/${id}`),
};

// Prescriptions API
export const prescriptionsApi = {
  getAll: (params?: any) => apiClient.get<ApiResponse>('/prescriptions', { params }),
  getDoctorPrescriptions: (params?: any) => apiClient.get<ApiResponse>('/prescriptions/doctor/prescriptions', { params }),
  getPharmacistPrescriptions: (params?: any) => apiClient.get<ApiResponse>('/prescriptions/pharmacist/prescriptions', { params }),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/prescriptions/${id}`),
  create: (data: any) => apiClient.post<ApiResponse>('/prescriptions', data),
  update: (id: string, data: any) => apiClient.patch<ApiResponse>(`/prescriptions/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/prescriptions/${id}`),
};

// Medicines API
export const medicinesApi = {
  getAll: (params?: any) => apiClient.get<ApiResponse>('/medicines', { params }),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/medicines/${id}`),
  create: (data: { name: string; description?: string }) => apiClient.post<ApiResponse>('/medicines', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<ApiResponse>(`/medicines/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/medicines/${id}`),
};

export const labTestTypesApi = {
  getAll: () => apiClient.get<ApiResponse>('/lab-test-types'),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/lab-test-types/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse>('/lab-test-types', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<ApiResponse>(`/lab-test-types/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/lab-test-types/${id}`),
  addQuestion: (typeId: string, data: { label: string; type: string; options?: string[] }) =>
    apiClient.post<ApiResponse>(`/lab-test-types/${typeId}/questions`, data),
  updateQuestion: (typeId: string, questionId: string, data: { label?: string; type?: string; options?: string[] }) =>
    apiClient.patch<ApiResponse>(`/lab-test-types/${typeId}/questions/${questionId}`, data),
  deleteQuestion: (typeId: string, questionId: string) =>
    apiClient.delete<ApiResponse>(`/lab-test-types/${typeId}/questions/${questionId}`),
};

export const labTestsApi = {
  getByConsultation: (consultationId: string) =>
    apiClient.get<ApiResponse>(`/lab-tests/consultation/${consultationId}`),
  getMyLabTests: (params?: { hospitalId?: string }) =>
    apiClient.get<ApiResponse>('/lab-tests/my', { params }),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/lab-tests/${id}`),
  complete: (id: string, data: { results: Record<string, string | number> }) =>
    apiClient.post<ApiResponse>(`/lab-tests/${id}/complete`, data),
  create: (data: { consultationId?: string; patientId: string; labTestTypeId: string; notes?: string }) =>
    apiClient.post<ApiResponse>('/lab-tests', data),
  recommendForConsultation: (consultationId: string, data: { labTestTypeId: string; notes?: string }) =>
    apiClient.post<ApiResponse>(`/consultations/${consultationId}/lab-tests`, data),
};

// Analytics API
export const analyticsApi = {
  getPlatformAnalytics: (params: any) =>
    apiClient.get<ApiResponse>('/analytics/platform', { params }),
};

export const hospitalsApi = {
  getMyHospitals: () => apiClient.get<ApiResponse>('/hospitals/my'),
  getAll: () => apiClient.get<ApiResponse>('/hospitals'),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/hospitals/${id}`),
  create: (data: any) => apiClient.post<ApiResponse>('/hospitals', data),
  update: (id: string, data: any) => apiClient.patch<ApiResponse>(`/hospitals/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/hospitals/${id}`),
  toggleActive: (id: string, active: boolean) =>
    apiClient.patch<ApiResponse>(`/hospitals/${id}/toggle-active`, { active }),
  getHospitalDoctors: (id: string) => apiClient.get<ApiResponse>(`/hospitals/${id}/doctors`),
  assignDoctor: (hospitalId: string, userId: string) =>
    apiClient.post<ApiResponse>(`/hospitals/${hospitalId}/assign-doctor`, { userId }),
  removeDoctor: (hospitalId: string, doctorId: string) =>
    apiClient.delete<ApiResponse>(`/hospitals/${hospitalId}/remove-doctor/${doctorId}`),
  getHospitalLabStaff: (id: string) => apiClient.get<ApiResponse>(`/hospitals/${id}/lab-staff`),
  assignLabStaff: (hospitalId: string, userId: string) =>
    apiClient.post<ApiResponse>(`/hospitals/${hospitalId}/assign-lab-staff`, { userId }),
  removeLabStaff: (hospitalId: string, labStaffId: string) =>
    apiClient.delete<ApiResponse>(`/hospitals/${hospitalId}/remove-lab-staff/${labStaffId}`),
};

export interface PharmacyMedicineItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  inventoryDate: string;
  quantity: number;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
}

export const pharmaciesApi = {
  getMyPharmacies: () => apiClient.get<ApiResponse>('/pharmacies/my'),
  getMyInventory: () => apiClient.get<ApiResponse>('/pharmacies/my-inventory'),
  addMyInventory: (data: { medicineId: string; quantity: number; minStockLevel?: number }) =>
    apiClient.post<ApiResponse>('/pharmacies/my-inventory', data),
  updateMyInventoryItem: (id: string, data: { quantity?: number; minStockLevel?: number }) =>
    apiClient.patch<ApiResponse>(`/pharmacies/my-inventory/${id}`, data),
  removeMyInventoryItem: (id: string) => apiClient.delete<ApiResponse>(`/pharmacies/my-inventory/${id}`),
  getAll: () => apiClient.get<ApiResponse>('/pharmacies'),
  getOne: (id: string) => apiClient.get<ApiResponse>(`/pharmacies/${id}`),
  create: (data: any) => apiClient.post<ApiResponse>('/pharmacies', data),
  update: (id: string, data: any) => apiClient.patch<ApiResponse>(`/pharmacies/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse>(`/pharmacies/${id}`),
  toggleActive: (id: string, active: boolean) =>
    apiClient.patch<ApiResponse>(`/pharmacies/${id}/toggle-active`, { active }),
  getPharmacyPharmacists: (id: string) => apiClient.get<ApiResponse>(`/pharmacies/${id}/pharmacists`),
  assignPharmacist: (pharmacyId: string, userId: string) =>
    apiClient.post<ApiResponse>(`/pharmacies/${pharmacyId}/assign-pharmacist`, { userId }),
  removePharmacist: (pharmacyId: string, pharmacistId: string) =>
    apiClient.delete<ApiResponse>(`/pharmacies/${pharmacyId}/remove-pharmacist/${pharmacistId}`),
};
