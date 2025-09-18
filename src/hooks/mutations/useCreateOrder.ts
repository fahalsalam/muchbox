import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { orderService } from '@/api/services';
import { OrderFormData, Order, ApiResponse, QUERY_KEYS } from '@/types';

export const useCreateOrder = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Order>, Error, OrderFormData>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      // Invalidate orders and dashboard queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_SUMMARY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_PIVOT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KITCHEN_ORDERS });
    },
    ...options,
  });
};

export default useCreateOrder;
