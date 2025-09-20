import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processService } from '@/api/services';
import { QUERY_KEYS } from '@/types';

interface DeliverAndProcessNotesVariables {
  orderDate: string;
  orderFor: string;
}

export const useDeliverAndProcessNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderDate, orderFor }: DeliverAndProcessNotesVariables) =>
      processService.deliverAndProcessNotes(orderDate, orderFor),
    onSuccess: () => {
      // Invalidate orders and dashboard queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};
