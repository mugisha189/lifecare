import { useQuery, type UseQueryResult } from '@tanstack/react-query';

type HealthResponse = {
  status: string;
  timestamp?: string;
  checks?: Record<string, string>;
};

const HEALTH_ENDPOINT = import.meta.env.VITE_API_BASE_URL + '/health' || '';

/**
 * Lightweight health check hook that pings the public health endpoint.
 * Uses react-query for caching and periodic refresh to keep the badge fresh.
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async (): Promise<HealthResponse> => {
      const response = await fetch(HEALTH_ENDPOINT);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  }) as UseQueryResult<HealthResponse>;
}

export type { HealthResponse };

