import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { ApiAgentCustomer, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetAgentCustomers = (
  options?: Omit<UseQueryOptions<ApiResponse<ApiAgentCustomer[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'],
    queryFn: () => customerService.getAgentCustomers(),
    ...options,
  });
};

export default useGetAgentCustomers;
