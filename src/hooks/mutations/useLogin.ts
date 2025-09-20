import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/api/services';
import { LoginCredentials, ApiResponse, LoginResponse, UserRole } from '@/types';
import { useUser } from '@/contexts/UserContext';

export const useLogin = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<LoginResponse>,
      Error,
      LoginCredentials
    >,
    'mutationFn'
  >
) => {
  const { setUser } = useUser();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // User data is already stored in localStorage by authService.login
      // Just update the UserContext for immediate access
      if (data.data) {
        const userData = {
          userID: data.data.userID,
          userName: data.data.userName,
          role: data.data.role
        };
        
        // Set user context for immediate access (localStorage already updated by authService)
        setUser(userData.userID, userData.userName, userData.role as UserRole);
        
        console.log('👤 User context updated after login:', userData);
        console.log('🔍 Login role validation:', {
          role: userData.role,
          roleType: typeof userData.role,
          isValidRole: ['Admin', 'Privileged', 'Normal', 'User'].includes(userData.role)
        });
      }
    },
    ...options,
  });
};

export default useLogin;
