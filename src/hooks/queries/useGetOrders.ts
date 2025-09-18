import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { orderService } from '@/api/services';
import { Order, OrderFilters, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetOrders = (
  filters?: OrderFilters,
  options?: Omit<UseQueryOptions<ApiResponse<Order[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, filters],
    queryFn: () => orderService.getOrders(filters),
    ...options,
  });
};

export default useGetOrders;
