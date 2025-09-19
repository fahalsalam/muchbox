import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { customerService } from '@/api/services';
import { ApiResponse, QUERY_KEYS } from '@/types';

interface UpdateCustomerStatusVariables {
  customerId: string;
  isDelete: boolean;
  customerType: 'individual' | 'company' | 'agent';
}

export const useUpdateCustomerStatus = (
  options?: Omit<
    UseMutationOptions<ApiResponse<void>, Error, UpdateCustomerStatusVariables>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, isDelete, customerType }: UpdateCustomerStatusVariables) => {
      console.log('🔄 Updating customer status:', { customerId, isDelete, customerType });
      
      // Optimistically update the cache BEFORE making the API call
      const queryKey = [QUERY_KEYS.CUSTOMERS, customerType];
      // FIXED LOGIC: isDelete=false means disable (Inactive), isDelete=true means enable (Active)
      const newStatus = isDelete ? 'Active' : 'Inactive';
      
      console.log('🔍 Status mapping:', { 
        isDelete, 
        newStatus, 
        customerId, 
        customerType 
      });
      
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const updatedData = {
          ...oldData,
          data: oldData.data.map((customer: any) => 
            customer.id.toString() === customerId 
              ? { ...customer, status: newStatus }
              : customer
          )
        };
        
        console.log('🔄 Optimistically updated cache BEFORE API call:', updatedData);
        return updatedData;
      });
      
      const result = await customerService.updateCustomerStatus(customerId, isDelete);
      console.log('✅ Customer status update response:', result);
      return result;
    },
    onSuccess: async (data, variables) => {
      console.log('🎉 Status update successful, invalidating queries...', { data, variables });
      
      // Invalidate and refetch the specific customer type list to ensure consistency
      const queryKey = [QUERY_KEYS.CUSTOMERS, variables.customerType];
      
      await queryClient.invalidateQueries({
        queryKey: queryKey
      });
      
      // Also refetch to ensure fresh data
      await queryClient.refetchQueries({
        queryKey: queryKey
      });
      
      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      
      console.log('🔄 Queries invalidated and refetched for:', variables.customerType);
    },
    onError: (error, variables) => {
      console.error('❌ Customer status update failed, reverting optimistic update:', { error, variables });
      
      // Revert the optimistic update on error
      const queryKey = [QUERY_KEYS.CUSTOMERS, variables.customerType];
      // FIXED LOGIC: isDelete=false means disable (Inactive), isDelete=true means enable (Active)
      const originalStatus = variables.isDelete ? 'Inactive' : 'Active';
      
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const revertedData = {
          ...oldData,
          data: oldData.data.map((customer: any) => 
            customer.id.toString() === variables.customerId 
              ? { ...customer, status: originalStatus }
              : customer
          )
        };
        
        console.log('🔄 Reverted optimistic update due to error:', revertedData);
        return revertedData;
      });
    },
    ...options,
  });
};

export default useUpdateCustomerStatus;
