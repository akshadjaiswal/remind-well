'use client';

import { ReminderForm } from '@/components/reminder-form';

export default function NewReminderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Reminder</h1>
        <p className="text-gray-500 mt-2">
          Set up a new reminder to help you build better habits
        </p>
      </div>

      <ReminderForm mode="create" />
    </div>
  );
}
