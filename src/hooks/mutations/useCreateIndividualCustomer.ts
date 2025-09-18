import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { CreateCustomerRequest, ApiResponse, QUERY_KEYS } from '@/types';

interface UseCreateIndividualCustomerOptions {
  onSuccess?: (data: ApiResponse<any>) => void;
  onError?: (error: any) => void;
}

export const useCreateIndividualCustomer = (options?: UseCreateIndividualCustomerOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: CreateCustomerRequest) => 
      customerService.createIndividualCustomer(customerData),
    onSuccess: (data) => {
      // Invalidate and refetch individual customers query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'] 
      });
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useCreateIndividualCustomer;
