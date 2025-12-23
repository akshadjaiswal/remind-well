'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReminderCard } from '@/components/reminder-card';
import { StatsBar } from '@/components/stats-bar';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useReminders } from '@/hooks/use-reminders';
import { useStats } from '@/hooks/use-stats';
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: stats } = useStats();

  const activeReminders = reminders?.filter((r) => !r.is_paused) || [];
  const pausedReminders = reminders?.filter((r) => r.is_paused) || [];

  // Get first name from email (max 15 chars)
  const getFirstName = (email: string) => {
    const name = email.split('@')[0];
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    return formatted.length > 15 ? formatted.substring(0, 15) : formatted;
  };

  if (remindersLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse-soft" />
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse-soft" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse-soft" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse-soft" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!reminders || reminders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user && getFirstName(user.email)}!
          </h1>
          <p className="text-gray-500">
            Manage your reminders and stay on track with your goals
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/reminders/new')}
          size="lg"
          className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Reminder
        </Button>
      </div>

      {/* Stats Bar */}
      <StatsBar
        activeCount={activeReminders.length}
        pausedCount={pausedReminders.length}
        todaySent={stats?.todaysSent || 0}
      />

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Active Reminders
            </h2>
            <span className="text-sm text-gray-500">
              ({activeReminders.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Reminders */}
      {pausedReminders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              Paused Reminders
            </h2>
            <span className="text-sm text-gray-500">
              ({pausedReminders.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pausedReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
