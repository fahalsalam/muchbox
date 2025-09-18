import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { CreateCompanyCustomerRequest, ApiResponse, QUERY_KEYS } from '@/types';

interface UseCreateCompanyCustomerOptions {
  onSuccess?: (data: ApiResponse<any>) => void;
  onError?: (error: any) => void;
}

export const useCreateCompanyCustomer = (options?: UseCreateCompanyCustomerOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: CreateCompanyCustomerRequest) => 
      customerService.createCompanyCustomer(customerData),
    onSuccess: (data) => {
      // Invalidate and refetch company customers query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CUSTOMERS, 'company'] 
      });
      
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useCreateCompanyCustomer;
