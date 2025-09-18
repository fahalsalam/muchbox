import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { dashboardService } from '@/api/services';
import { DashboardData, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetDashboard = (
  options?: Omit<UseQueryOptions<ApiResponse<DashboardData>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: dashboardService.getDashboardData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

export default useGetDashboard;
