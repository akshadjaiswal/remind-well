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
import { useUIStore } from '@/lib/stores/ui-store';
import { useDeleteReminder } from '@/hooks/use-reminders';

export function DeleteConfirmationModal() {
  const { isDeleteModalOpen, reminderToDelete, closeDeleteModal } = useUIStore();
  const deleteMutation = useDeleteReminder();

  const handleConfirm = async () => {
    if (reminderToDelete) {
      await deleteMutation.mutateAsync(reminderToDelete);
      closeDeleteModal();
    }
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Reminder?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All notification history for this reminder will be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeDeleteModal}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
