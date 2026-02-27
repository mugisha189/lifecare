import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api'; // Removed ridesApi to fix ESLint error

// 1. Define the detailed data structure for the charts
export interface AnalyticsChartData {
  month: string;
  rides: number;
  revenue: number;
}

export interface ProfitChartData {
  month: string;
  rides: number;
  profit: number;
}

// 2. Define the structure of the data inside ApiResponse
export interface AnalyticsDataResponse {
  totalRevenue: number;
  totalRides: number;
  activeDrivers: number;
  avgSatisfaction: number;
  series: AnalyticsChartData[];      // This fixes the "Property series does not exist" error
  profitSeries: ProfitChartData[];   // This fixes the "Property profitSeries does not exist" error
}

export const useAnalytics = () => {
  const [analyticsFilter, setAnalyticsFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'>('YEAR');
  const [profitFilter, setProfitFilter] = useState('2024');

  // Fetch Analytics Data
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['platform-analytics', analyticsFilter, profitFilter],
    queryFn: async () => {
      const response = await analyticsApi.getPlatformAnalytics({ 
        period: analyticsFilter,
        startDate: `${profitFilter}-01-01` // Example logic for the year filter
      });

      if (response.data.ok && response.data.data) {
        // We cast the data to our specific interface
        return response.data.data as unknown as AnalyticsDataResponse;
      }
      throw new Error(response.data.message || 'Failed to fetch analytics');
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  return {
    analyticsFilter,
    setAnalyticsFilter,
    profitFilter,
    setProfitFilter,
    // Data mapping
    stats: data,
    chartData: data?.series || [],
    profitData: data?.profitSeries || [],
    loading,
    error,
    hasAnalyticsData: (data?.series?.length ?? 0) > 0,
    hasProfitData: (data?.profitSeries?.length ?? 0) > 0,
  };
};