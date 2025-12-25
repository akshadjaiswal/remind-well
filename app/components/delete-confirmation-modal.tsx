'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui-store';
import { useDeleteReminder } from '@/hooks/use-reminders';

export function DeleteConfirmationModal() {
  const { isDeleteModalOpen, reminderToDelete, closeDeleteModal } = useUIStore();
  const deleteMutation = useDeleteReminder();

  const handleConfirm = async () => {
    if (!reminderToDelete) {
      console.error('No reminder ID to delete');
      return;
    }

    try {
      await deleteMutation.mutateAsync(reminderToDelete);
      closeDeleteModal();
    } catch (error) {
      console.error('Delete error:', error);
      // Modal will stay open on error, mutation hook will show toast
    }
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Warning Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-100 mb-4 animate-pulse-soft">
            <AlertTriangle className="h-7 w-7 text-error-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Delete Reminder?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            This action cannot be undone. All notification history for this reminder will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={closeDeleteModal}
            disabled={deleteMutation.isPending}
            className="flex-1 sm:flex-initial sm:min-w-[120px] h-11"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            loading={deleteMutation.isPending}
            className="flex-1 sm:flex-initial sm:min-w-[120px] h-11 bg-error-600 hover:bg-error-700"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
