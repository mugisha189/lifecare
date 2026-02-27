import { useUserRole } from '@/hooks/useRole';
import { useWorkspaceOptional } from '@/context/WorkspaceContext';
import { Building2 } from 'lucide-react';

interface RequireHospitalAssignmentProps {
  children: React.ReactNode;
}

/**
 * For DOCTOR and LABORATORY_STAFF: if the user has no hospital assigned,
 * show "You are not assigned to hospital yet" instead of children.
 * Other roles see children as usual.
 */
export function RequireHospitalAssignment({ children }: RequireHospitalAssignmentProps) {
  const userRole = useUserRole();
  const workspace = useWorkspaceOptional();
  const isDoctorOrLab = userRole === 'DOCTOR' || userRole === 'LABORATORY_STAFF';

  if (!isDoctorOrLab || !workspace) {
    return <>{children}</>;
  }

  const { hospitals, isLoadingHospitals } = workspace;
  const hasNoHospital = !isLoadingHospitals && hospitals.length === 0;

  if (hasNoHospital) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-amber-100 p-4 mb-4">
          <Building2 className="h-12 w-12 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">You are not assigned to a hospital yet</h2>
        <p className="text-gray-600 max-w-md">
          Please contact your administrator to be assigned to a hospital. You will not be able to access consultations or lab tests until then.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
