import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/api/services';
import { PostInvoiceRequest, QUERY_KEYS } from '@/types';

export const usePostInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostInvoiceRequest) => invoiceService.postInvoice(data),
    onSuccess: () => {
      // Invalidate invoice queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['monthlyInvoiceSummary'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};
