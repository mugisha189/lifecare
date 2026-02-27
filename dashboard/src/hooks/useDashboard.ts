import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AxiosError } from 'axios';
import { analyticsApi } from '@/lib/api';

export interface PlatformAnalytics {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    inactiveUsers: number;
  };
  doctors?: {
    totalDoctors: number;
    activeDoctors: number;
    verifiedDoctors: number;
    pendingVerification: number;
  };
  patients?: {
    totalPatients: number;
  };
  consultations?: {
    totalConsultations: number;
    completedConsultations: number;
    scheduledConsultations: number;
    cancelledConsultations: number;
    completionRate: number;
  };
  prescriptions?: {
    totalPrescriptions: number;
    dispensedPrescriptions: number;
    cancellationRate: number;
  };
  // Legacy fields for backward compatibility (deprecated)
  drivers?: {
    totalDrivers: number;
    activeDrivers: number;
    verifiedDrivers: number;
    pendingVerification: number;
  };
  passengers?: {
    totalPassengers: number;
  };
  rides?: {
    totalRides: number;
    completedRides: number;
    ongoingRides: number;
    cancelledRides: number;
    completionRate: number;
    today?: number;
  };
  bookings?: {
    totalBookings: number;
    confirmedBookings: number;
    cancellationRate: number;
  };
  revenue?: {
    totalRevenue: number;
    averageRevenuePerRide: number;
  };
  reviews?: {
    totalReviews: number;
    averagePlatformRating: number;
    flaggedReviews: number;
  };
  issues?: {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    resolutionRate: number;
  };
  insights?: {
    paymentMethods: Record<string, unknown>;
    topDoctors?: Array<unknown>;
    topDrivers?: Array<unknown>; // Deprecated
    dailyActivityTrend: Array<unknown>;
  };
}

export interface DashboardFilters {
  // Backend expects: TODAY, WEEK, MONTH, YEAR, CUSTOM
  period?: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useDashboard = (filters?: DashboardFilters) => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [filters?.period, filters?.startDate, filters?.endDate, filters?.limit]
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsApi.getPlatformAnalytics(memoizedFilters);

      if (response.data.ok && response.data.data) {
        const analyticsData = response.data.data as unknown as PlatformAnalytics;
        setAnalytics(analyticsData);
      } else {
        setError(response.data.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
