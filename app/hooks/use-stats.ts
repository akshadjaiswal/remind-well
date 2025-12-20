// TanStack Query hooks for stats

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/types/models';

// Fetch dashboard stats
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ stats: DashboardStats }>('/api/stats');
      return data.stats;
    }
  });
}
