import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { orderService } from '@/api/services';
import { OrderFormData, Order, ApiResponse, QUERY_KEYS } from '@/types';

interface UpdateOrderVariables {
  data: Partial<OrderFormData>;
  orderId: string;
  orderAID?: string;
}

export const useUpdateOrder = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Order>, Error, UpdateOrderVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, orderId, orderAID }: UpdateOrderVariables) =>
      orderService.updateOrder(data, orderId, orderAID),
    onSuccess: (_, variables) => {
      // Invalidate orders queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ORDER(variables.orderId) 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_SUMMARY });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_PIVOT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KITCHEN_ORDERS });
    },
    ...options,
  });
};

export default useUpdateOrder;
