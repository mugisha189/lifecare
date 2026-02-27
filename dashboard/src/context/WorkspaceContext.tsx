import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useRole';
import { hospitalsApi, pharmaciesApi } from '@/lib/api';

const STORAGE_HOSPITAL = 'lifecare_selected_hospital_id';
const STORAGE_PHARMACY = 'lifecare_selected_pharmacy_id';

interface Hospital {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

interface WorkspaceContextValue {
  hospitalId: string | null;
  pharmacyId: string | null;
  setHospitalId: (id: string | null) => void;
  setPharmacyId: (id: string | null) => void;
  hospitals: Hospital[];
  pharmacies: Pharmacy[];
  isLoadingHospitals: boolean;
  isLoadingPharmacies: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const userRole = useUserRole();
  const isDoctorOrLab = userRole === 'DOCTOR' || userRole === 'LABORATORY_STAFF';
  const isPharmacist = userRole === 'PHARMACIST';

  const [hospitalId, setHospitalIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_HOSPITAL);
  });
  const [pharmacyId, setPharmacyIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_PHARMACY);
  });

  const setHospitalId = useCallback((id: string | null) => {
    setHospitalIdState(id);
    if (typeof window !== 'undefined') {
      if (id) window.localStorage.setItem(STORAGE_HOSPITAL, id);
      else window.localStorage.removeItem(STORAGE_HOSPITAL);
    }
  }, []);

  const setPharmacyId = useCallback((id: string | null) => {
    setPharmacyIdState(id);
    if (typeof window !== 'undefined') {
      if (id) window.localStorage.setItem(STORAGE_PHARMACY, id);
      else window.localStorage.removeItem(STORAGE_PHARMACY);
    }
  }, []);

  const { data: hospitalsData, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ['my-hospitals'],
    queryFn: async () => {
      const res = await hospitalsApi.getMyHospitals();
      return res.data;
    },
    enabled: isDoctorOrLab ?? false,
  });

  const { data: pharmaciesData, isLoading: isLoadingPharmacies } = useQuery({
    queryKey: ['my-pharmacies'],
    queryFn: async () => {
      const res = await pharmaciesApi.getMyPharmacies();
      return res.data;
    },
    enabled: isPharmacist ?? false,
  });

  const hospitals = useMemo(() => {
    const list = Array.isArray(hospitalsData?.data) ? hospitalsData.data : [];
    return list as Hospital[];
  }, [hospitalsData]);

  const pharmacies = useMemo(() => {
    const list = Array.isArray(pharmaciesData?.data) ? pharmaciesData.data : [];
    return list as Pharmacy[];
  }, [pharmaciesData]);

  useEffect(() => {
    if (!isDoctorOrLab || hospitals.length === 0) return;
    if (!hospitalId && hospitals.length === 1) setHospitalId(hospitals[0].id);
  }, [isDoctorOrLab, hospitals, hospitalId, setHospitalId]);

  useEffect(() => {
    if (!isPharmacist || pharmacies.length === 0) return;
    if (!pharmacyId && pharmacies.length === 1) setPharmacyId(pharmacies[0].id);
  }, [isPharmacist, pharmacies, pharmacyId, setPharmacyId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      hospitalId,
      pharmacyId,
      setHospitalId,
      setPharmacyId,
      hospitals,
      pharmacies,
      isLoadingHospitals: isLoadingHospitals ?? false,
      isLoadingPharmacies: isLoadingPharmacies ?? false,
    }),
    [
      hospitalId,
      pharmacyId,
      setHospitalId,
      setPharmacyId,
      hospitals,
      pharmacies,
      isLoadingHospitals,
      isLoadingPharmacies,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

export function useWorkspaceOptional() {
  return useContext(WorkspaceContext);
}
