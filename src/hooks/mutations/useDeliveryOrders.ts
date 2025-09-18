import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { deliveryService } from '@/api/services';
import { ApiResponse, QUERY_KEYS } from '@/types';

interface DeliveryOrdersVariables {
  orderIds: string[];
  deliveryAddress: string;
  deliveryTime: string;
}

export const useDeliveryOrders = (
  options?: Omit<
    UseMutationOptions<ApiResponse<void>, Error, DeliveryOrdersVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deliveryService.deliverOrders,
    onSuccess: () => {
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_NOTES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    ...options,
  });
};

export default useDeliveryOrders;
