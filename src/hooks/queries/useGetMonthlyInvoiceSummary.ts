import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { invoiceService } from '@/api/services';
import { MonthlyInvoiceSummary, ApiResponse } from '@/types';

export const useGetMonthlyInvoiceSummary = (
  options?: Omit<UseQueryOptions<ApiResponse<MonthlyInvoiceSummary[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['monthlyInvoiceSummary'],
    queryFn: () => invoiceService.getMonthlyInvoiceSummary(),
    ...options,
  });
};

export default useGetMonthlyInvoiceSummary;
