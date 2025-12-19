'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToggleReminder } from '@/hooks/use-reminders';
import { useUIStore } from '@/lib/stores/ui-store';
import type { Reminder } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const router = useRouter();
  const toggleMutation = useToggleReminder();
  const { openDeleteModal } = useUIStore();

  const handleToggle = () => {
    toggleMutation.mutate(reminder.id);
  };

  const handleEdit = () => {
    router.push(`/dashboard/reminders/${reminder.id}`);
  };

  const handleDelete = () => {
    openDeleteModal(reminder.id);
  };

  const getMethodBadge = () => {
    if (reminder.notification_method === 'both') {
      return <Badge variant="outline">Telegram & Email</Badge>;
    }
    if (reminder.notification_method === 'telegram') {
      return <Badge variant="outline">Telegram</Badge>;
    }
    return <Badge variant="outline">Email</Badge>;
  };

  const nextScheduledText = reminder.next_scheduled_at
    ? `Next: ${formatDistanceToNow(new Date(reminder.next_scheduled_at), { addSuffix: true })}`
    : 'Not scheduled';

  return (
    <Card className={reminder.is_paused ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{reminder.emoji}</span>
            <div>
              <h3 className="font-semibold text-lg">{reminder.title}</h3>
              <p className="text-sm text-gray-500">{reminder.frequencyText}</p>
            </div>
          </div>
          <Switch
            checked={!reminder.is_paused}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {getMethodBadge()}
          <Badge variant="secondary" className="capitalize">
            {reminder.message_tone}
          </Badge>
          {reminder.skip_weekends && (
            <Badge variant="secondary">Skip weekends</Badge>
          )}
          {reminder.active_hours_start && reminder.active_hours_end && (
            <Badge variant="secondary">
              {reminder.active_hours_start} - {reminder.active_hours_end}
            </Badge>
          )}
        </div>

        {!reminder.is_paused && (
          <p className="text-xs text-gray-500">{nextScheduledText}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
