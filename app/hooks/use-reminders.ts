// TanStack Query hooks for reminders

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Reminder } from '@/types/models';
import { CreateReminderRequest, UpdateReminderRequest } from '@/types/api.types';
import { useUIStore } from '@/lib/stores/ui-store';

// Fetch all reminders
export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ reminders: Reminder[] }>('/api/reminders');
      return data.reminders;
    }
  });
}

// Fetch single reminder
export function useReminder(id: string) {
  return useQuery({
    queryKey: ['reminders', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ reminder: Reminder }>(`/api/reminders/${id}`);
      return data.reminder;
    },
    enabled: !!id
  });
}

// Create reminder
export function useCreateReminder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  return useMutation({
    mutationFn: async (reminder: CreateReminderRequest) => {
      const { data } = await apiClient.post('/api/reminders', reminder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast('Reminder created successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to create reminder', 'error');
    }
  });
}

// Update reminder
export function useUpdateReminder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReminderRequest }) => {
      const response = await apiClient.patch(`/api/reminders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast('Reminder updated', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update reminder', 'error');
    }
  });
}

// Delete reminder
export function useDeleteReminder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast('Reminder deleted', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete reminder', 'error');
    }
  });
}

// Toggle reminder pause state (with optimistic update)
export function useToggleReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/api/reminders/${id}/toggle`);
      return data;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reminders'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['reminders']);

      // Optimistically update
      queryClient.setQueryData(['reminders'], (old: Reminder[] = []) =>
        old.map(r => r.id === id ? { ...r, is_paused: !r.is_paused } : r)
      );

      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(['reminders'], context?.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  });
}
