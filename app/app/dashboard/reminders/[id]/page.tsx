'use client';

import { use } from 'react';
import { useReminders } from '@/hooks/use-reminders';
import { ReminderForm } from '@/components/reminder-form';

export default function EditReminderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: reminders, isLoading } = useReminders();

  const reminder = reminders?.find((r) => r.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🔔</div>
          <p className="text-gray-500">Loading reminder...</p>
        </div>
      </div>
    );
  }

  if (!reminder) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Reminder not found</h2>
        <p className="text-gray-500">The reminder you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Reminder</h1>
        <p className="text-gray-500 mt-2">
          Update your reminder settings
        </p>
      </div>

      <ReminderForm reminder={reminder} mode="edit" />
    </div>
  );
}
