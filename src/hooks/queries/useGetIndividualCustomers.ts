import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { ApiIndividualCustomer, ApiResponse, QUERY_KEYS } from '@/types';

export const useGetIndividualCustomers = (
  options?: Omit<UseQueryOptions<ApiResponse<ApiIndividualCustomer[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'],
    queryFn: () => customerService.getIndividualCustomers(),
    ...options,
  });
};

export default useGetIndividualCustomers;
