import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { Customer, CustomerType, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetCustomers = (
  customerType?: CustomerType,
  options?: Omit<UseQueryOptions<ApiResponse<Customer[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: customerType ? QUERY_KEYS.CUSTOMERS_BY_TYPE(customerType) : QUERY_KEYS.CUSTOMERS,
    queryFn: () => customerService.getCustomers(customerType),
    ...options,
  });
};

export default useGetCustomers;
