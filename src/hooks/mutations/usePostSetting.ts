import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/api/services';
import { PostSettingRequest } from '@/types';
import { QUERY_KEYS } from '@/types';
import { showToast } from '@/lib/toast';

export function usePostSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setting: PostSettingRequest) => 
      settingsService.postSetting(setting),
    
    onSuccess: (_, variables) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      showToast.success(`Setting "${variables.settingKey}" updated successfully!`);
    },
    
    onError: (error: any, variables) => {
      console.error('Post setting error:', error);
      const errorMessage = error?.message || `Failed to update setting "${variables.settingKey}". Please try again.`;
      showToast.error(errorMessage);
    },
  });
}
