import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { CreateAgentCustomerRequest, ApiResponse, QUERY_KEYS } from '@/types';

interface UseCreateAgentCustomerOptions {
  onSuccess?: (data: ApiResponse<any>) => void;
  onError?: (error: any) => void;
}

export const useCreateAgentCustomer = (options?: UseCreateAgentCustomerOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: CreateAgentCustomerRequest) => 
      customerService.createAgentCustomer(customerData),
    onSuccess: (data) => {
      // Invalidate and refetch agent customers query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] 
      });
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useCreateAgentCustomer;
