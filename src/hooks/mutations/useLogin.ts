import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { authService } from '@/api/services';
import { LoginCredentials, ApiResponse } from '@/types';

export const useLogin = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<{ token: string; user: any }>,
      Error,
      LoginCredentials
    >,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store token and login state
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('isLoggedIn', 'true');
      }
    },
    ...options,
  });
};

export default useLogin;
