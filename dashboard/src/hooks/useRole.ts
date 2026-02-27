import useAuth from '@/hooks/useAuth';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'LABORATORY_STAFF' | 'PATIENT';

/**
 * Hook to get current user role
 */
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  if (!user?.role) return null;
  return user.role.toUpperCase() as UserRole;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const role = useUserRole();
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(['ADMIN']);
}

/**
 * Hook to check if user is doctor
 */
export function useIsDoctor(): boolean {
  return useHasRole(['DOCTOR']);
}

/**
 * Hook to check if user is pharmacist
 */
export function useIsPharmacist(): boolean {
  return useHasRole(['PHARMACIST']);
}

/**
 * Hook to check if user is lab staff
 */
export function useIsLabStaff(): boolean {
  return useHasRole(['LABORATORY_STAFF']);
}

/**
 * Hook to check if user can access dashboard (not a patient)
 */
export function useCanAccessDashboard(): boolean {
  const role = useUserRole();
  return role !== null && role !== 'PATIENT';
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role: UserRole): string[] {
  const roleRoutes: Record<UserRole, string[]> = {
    ADMIN: [
      '/dashboard',
      '/dashboard/users',
      '/dashboard/doctors',
      '/dashboard/consultations',
      '/dashboard/prescriptions',
      '/dashboard/lab-tests',
      '/dashboard/medicines',
      '/dashboard/hospitals',
      '/dashboard/reviews',
      '/dashboard/issues',
      '/dashboard/transactions',
      '/dashboard/settings',
    ],
    DOCTOR: [
      '/dashboard',
      '/dashboard/consultations',
      '/dashboard/prescriptions',
      '/dashboard/lab-tests',
      '/dashboard/settings',
    ],
    PHARMACIST: [
      '/dashboard',
      '/dashboard/prescriptions',
      '/dashboard/medicines',
      '/dashboard/settings',
    ],
    LABORATORY_STAFF: [
      '/dashboard',
      '/dashboard/lab-tests',
      '/dashboard/settings',
    ],
    PATIENT: [], // Patients cannot access dashboard
  };

  return roleRoutes[role] || [];
}
