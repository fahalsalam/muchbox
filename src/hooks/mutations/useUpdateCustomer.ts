import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { CustomerFormData, Customer, CustomerType, ApiResponse, QUERY_KEYS } from '@/types';

interface UpdateCustomerVariables {
  data: Partial<CustomerFormData>;
  customerId: string;
  customerType: CustomerType;
  forzaCustomerID?: string;
}

export const useUpdateCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<Customer>, Error, UpdateCustomerVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, customerId, customerType, forzaCustomerID }: UpdateCustomerVariables) =>
      customerService.updateCustomer(data, customerId, customerType, forzaCustomerID),
    onSuccess: (_, variables) => {
      // Invalidate customers queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CUSTOMERS, variables.customerType] 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CUSTOMER(variables.customerId) 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    ...options,
  });
};

export default useUpdateCustomer;
