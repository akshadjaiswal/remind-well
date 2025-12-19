'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReminderCard } from '@/components/reminder-card';
import { StatsBar } from '@/components/stats-bar';
import { EmptyState } from '@/components/empty-state';
import { useReminders } from '@/hooks/use-reminders';
import { useStats } from '@/hooks/use-stats';

export default function DashboardPage() {
  const router = useRouter();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: stats } = useStats();

  const activeReminders = reminders?.filter((r) => !r.is_paused) || [];
  const pausedReminders = reminders?.filter((r) => r.is_paused) || [];

  if (remindersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">💧</div>
          <p className="text-gray-500">Loading your reminders...</p>
        </div>
      </div>
    );
  }

  if (!reminders || reminders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Reminders</h1>
        <Button onClick={() => router.push('/dashboard/reminders/new')}>
          <Plus className="mr-2 h-5 w-5" />
          Add Reminder
        </Button>
      </div>

      <StatsBar
        activeCount={activeReminders.length}
        pausedCount={pausedReminders.length}
        todaySent={stats?.todaysSent || 0}
      />

      {activeReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {pausedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Paused</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pausedReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
