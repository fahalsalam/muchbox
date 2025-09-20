import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/api/services';
import { UpdateSettingsRequest } from '@/types';
import { QUERY_KEYS } from '@/types';
import { showToast } from '@/lib/toast';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateSettingsRequest) => 
      settingsService.updateSettings(settings),
    
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      showToast.success('Settings updated successfully!');
    },
    
    onError: (error: any) => {
      console.error('Update settings error:', error);
      const errorMessage = error?.message || 'Failed to update settings. Please try again.';
      showToast.error(errorMessage);
    },
  });
}
