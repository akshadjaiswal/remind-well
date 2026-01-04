// UI store - Toast notifications and modal state

import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIStore {
  // Toast notifications
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Delete confirmation modal
  isDeleteModalOpen: boolean;
  reminderToDelete: string | null;
  openDeleteModal: (reminderId: string) => void;
  closeDeleteModal: () => void;

  // Telegram setup modal
  isTelegramModalOpen: boolean;
  openTelegramModal: () => void;
  closeTelegramModal: () => void;

  // Reset all state (for logout)
  reset: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Toast state
  toasts: [],

  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  // Delete modal state
  isDeleteModalOpen: false,
  reminderToDelete: null,

  openDeleteModal: (reminderId) => set({
    isDeleteModalOpen: true,
    reminderToDelete: reminderId
  }),

  closeDeleteModal: () => set({
    isDeleteModalOpen: false,
    reminderToDelete: null
  }),

  // Telegram modal state
  isTelegramModalOpen: false,

  openTelegramModal: () => set({ isTelegramModalOpen: true }),

  closeTelegramModal: () => set({ isTelegramModalOpen: false }),

  // Reset function
  reset: () => set({
    toasts: [],
    isDeleteModalOpen: false,
    reminderToDelete: null,
    isTelegramModalOpen: false
  })
}));
