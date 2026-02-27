import { useState, useEffect, useCallback } from 'react';
import { doctorApi, userApi, type DoctorProfileResponse } from '@/lib/api';
import { toast } from 'sonner';

type DoctorStatusFilter = 'active' | 'suspended' | 'inactive' | 'all';
type ApiStatusParam = 'active' | 'suspended' | 'inactive' | undefined;

export const useDoctorsManagement = () => {
  const [allDoctors, setAllDoctors] = useState<DoctorProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DoctorStatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfileResponse | null>(null);

  const fetchDoctors = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const mappedStatus: ApiStatusParam = statusFilter === 'all' ? undefined : statusFilter;

      const response = await doctorApi.getDoctors({ 
        page, 
        limit: 20,
        status: mappedStatus,
        search: searchQuery || undefined
      });

      if (response.data?.ok && response.data.data) {
        // Backend returns { doctorProfiles: [], pagination: {} } structure
        if (Array.isArray(response.data.data)) {
          // Handle array response (fallback)
          const doctors = response.data.data;
          setAllDoctors(doctors);
          setPagination({ 
            total: doctors.length, 
            page, 
            totalPages: Math.ceil(doctors.length / 20) 
          });
        } else if (response.data.data.doctorProfiles) {
          // Handle object response with pagination (preferred)
          const doctors = response.data.data.doctorProfiles || [];
          setAllDoctors(doctors);
          setPagination(response.data.data.pagination || { 
            total: doctors.length, 
            page, 
            totalPages: Math.ceil(doctors.length / 20) 
          });
        }
      }
    } catch {
      toast.error("Failed to sync with doctor database");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchDoctors(1);
  }, [fetchDoctors]);

  const handleAction = async (
    action: 'suspend' | 'activate' | 'delete', 
    doctorId: string, 
    reason?: string
  ) => {
    try {
      if (action === 'suspend') {
        await doctorApi.suspendDoctor(doctorId, reason || "Administrative suspension");
        toast.success("Doctor account suspended");
      } else if (action === 'activate') {
        await doctorApi.unsuspendDoctor(doctorId);
        toast.success("Doctor account activated");
      } else if (action === 'delete') {
        await doctorApi.deleteDoctor(doctorId);
        toast.success("Doctor record permanently removed");
      }
      
      await fetchDoctors(pagination.page);
      setSelectedDoctor(null);
    } catch {
      toast.error("Action failed. Please check backend validation.");
    }
  };

  const updateDoctor = async (id: string, data: { name?: string; phoneNumber?: string; city?: string }) => {
    try {
      setIsUpdating(true);
      const response = await userApi.updateUser(id, data);
      if (response.data.ok) {
        toast.success("Profile updated successfully");
        await fetchDoctors(pagination.page);
        setSelectedDoctor(null);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return {
    doctors: allDoctors,
    loading,
    isUpdating,
    pagination,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    selectedDoctor,
    setSelectedDoctor,
    handleAction,
    updateDoctor,
    resetFilters,
    refresh: fetchDoctors
  };
};

// Legacy export for backward compatibility (deprecated)
export const useDriversManagement = useDoctorsManagement;