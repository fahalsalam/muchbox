import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ApiResponse, SettingsResponse } from '@/types';

export function useGetSettings() {
  // Disable the settings API call since settings come from login response
  // This prevents 404 errors when the endpoint doesn't exist
  return useQuery<ApiResponse<SettingsResponse>>({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: () => Promise.resolve({ 
      success: false, 
      message: 'Settings loaded from login', 
      data: {
        dayCutOffTime: '14:30',
        nightCutOffTime: '22:00',
        morningWindowEnd: '14:30'
      }
    }),
    enabled: false, // Disable the query
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
  });
}
