import useAuth from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCanAccessDashboard } from '@/hooks/useRole';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const AuthLoadingScreen = () => (
  <div className='min-h-screen flex items-center justify-center bg-background'>
    <div className='flex flex-col items-center gap-4'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      <p className='text-sm text-primary'>Checking authentication...</p>
    </div>
  </div>
);

/**
 * AuthGuard - Protects routes requiring authentication
 * Also blocks PATIENT role from accessing dashboard (patients use mobile app only)
 */
export default function AuthGuard({ redirectPath = '/auth/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const canAccessDashboard = useCanAccessDashboard();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Block PATIENT role from accessing dashboard
  if (!canAccessDashboard) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center p-8 max-w-md'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Access Restricted</h2>
          <p className='text-gray-600 mb-4'>
            Patient accounts cannot access the dashboard. Please use the LifeCare mobile app to access your healthcare services.
          </p>
          <button
            onClick={() => {
              // Logout and redirect
              localStorage.clear();
              window.location.href = '/auth/login';
            }}
            className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90'
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export function PublicOnlyRoute({ redirectPath = '/dashboard' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || redirectPath;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
