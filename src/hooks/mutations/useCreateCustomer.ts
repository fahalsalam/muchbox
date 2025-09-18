    import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { CustomerFormData, Customer, ApiResponse, QUERY_KEYS } from '@/types';

export const useCreateCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Customer>, Error, CustomerFormData>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: (data) => {
      // Invalidate customers queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CUSTOMERS_BY_TYPE(data.data.customerType) 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    ...options,
  });
};

export default useCreateCustomer;
