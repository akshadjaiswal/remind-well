// TanStack Query hooks for user

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/models';
import { UpdateUserRequest } from '@/types/api.types';
import { useUIStore } from '@/lib/stores/ui-store';

// Fetch current user
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ user: User }>('/api/user');
      return data.user;
    }
  });
}

// Update user profile
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  return useMutation({
    mutationFn: async (updates: UpdateUserRequest) => {
      const { data } = await apiClient.patch('/api/user', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      addToast('Profile updated', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update profile', 'error');
    }
  });
}
