import { useAtom } from 'jotai';
import { userAtom } from '@/store/authAtoms';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'PHARMACIST' | 'LABORATORY_STAFF' | 'ADMIN' | null;

export function useUserRole() {
  const [user] = useAtom(userAtom);

  const roleName = user?.currentRole?.name?.toUpperCase() || null;
  const role: UserRole = roleName as UserRole;
  const isDoctor = roleName === 'DOCTOR';
  const isPatient = roleName === 'PATIENT';
  const isPharmacist = roleName === 'PHARMACIST';
  const isLabStaff = roleName === 'LABORATORY_STAFF';

  return {
    role,
    isDoctor,
    isPatient,
    isPharmacist,
    isLabStaff,
  };
}
