import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse, QUERY_KEYS } from '@/types';

interface UpdateAgentCustomerVariables {
  data: {
    id: number;
    name: string;
    mobile: string;
    address: string;
    joinedDate: string;
    breakfastPrice: string;
    lunchPrice: string;
    dinnerPrice: string;
    creditLimit: string;
    creditDays: string;
    status: string;
  };
  customerId: string;
}

export const useUpdateAgentCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, UpdateAgentCustomerVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, customerId }: UpdateAgentCustomerVariables) => {
      // Use the direct API call with the correct format
      const response = await fetch('https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/putCustomerMaster', {
        method: 'PUT',
        headers: {
          'accept': 'text/plain',
          'customerType': 'agent',
          'customerId': customerId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate agent customers query to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
    ...options,
  });
};

export default useUpdateAgentCustomer;
