import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { kitchenService } from '@/api/services';
import { ApiResponse, QUERY_KEYS } from '@/types';

interface ProcessOrdersVariables {
  orderIds: string[];
  status: string;
}

export const useProcessOrders = (
  options?: Omit<
    UseMutationOptions<ApiResponse<void>, Error, ProcessOrdersVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kitchenService.processOrders,
    onSuccess: () => {
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KITCHEN_ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    ...options,
  });
};

export default useProcessOrders;
