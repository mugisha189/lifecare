import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'LABORATORY_STAFF';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * RoleGuard component that restricts access based on user role
 * Dashboard is for ADMIN, DOCTOR, PHARMACIST, LABORATORY_STAFF (not PATIENT)
 */
export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='text-sm text-primary'>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/auth/login' replace />;
  }

  const userRole = user.role?.toUpperCase() as UserRole;

  // Block PATIENT role from accessing dashboard
  if (userRole === 'PATIENT') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Access Denied</h2>
          <p className='text-gray-600 mb-4'>
            Patient accounts cannot access the dashboard. Please use the mobile app.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Access Denied</h2>
          <p className='text-gray-600 mb-4'>
            You don't have permission to access this page.
          </p>
          <Navigate to={fallbackPath} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  const userRole = user.role?.toUpperCase() as UserRole;
  return allowedRoles.includes(userRole);
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
