import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryService } from '@/api/services';
import { QUERY_KEYS } from '@/types';

interface ProcessDeliveryOrdersVariables {
  orderDate: string;
  orderFor: string;
}

export const useProcessDeliveryOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderDate, orderFor }: ProcessDeliveryOrdersVariables) =>
      deliveryService.processDeliveryOrders(orderDate, orderFor),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};
