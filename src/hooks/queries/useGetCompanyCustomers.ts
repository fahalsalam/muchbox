import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { ApiCompanyCustomer, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetCompanyCustomers = (
  options?: Omit<UseQueryOptions<ApiResponse<ApiCompanyCustomer[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'company'],
    queryFn: () => customerService.getCompanyCustomers(),
    ...options,
  });
};

export default useGetCompanyCustomers;
