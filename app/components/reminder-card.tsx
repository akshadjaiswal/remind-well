'use client';

import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Clock, Mail, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToggleReminder } from '@/hooks/use-reminders';
import { useUIStore } from '@/lib/stores/ui-store';
import type { Reminder } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const getMethodIcon = () => {
    if (reminder.notification_method === 'both') {
      return (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <Mail className="h-3.5 w-3.5" />
        </div>
      );
    }
    if (reminder.notification_method === 'telegram') {
      return <MessageSquare className="h-3.5 w-3.5" />;
    }
    return <Mail className="h-3.5 w-3.5" />;
  };

  const nextScheduledText = reminder.next_scheduled_at
    ? formatDistanceToNow(new Date(reminder.next_scheduled_at), { addSuffix: true })
    : 'Not scheduled';

  return (
    <Card
      className={cn(
        'group hover:shadow-medium transition-all duration-200 overflow-hidden border-gray-200',
        'hover:border-primary-200 hover:-translate-y-1',
        reminder.is_paused && 'opacity-60'
      )}
    >
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-4xl flex-shrink-0">{reminder.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {reminder.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{reminder.frequencyText}</p>
            </div>
          </div>
          <Switch
            checked={!reminder.is_paused}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
            className="flex-shrink-0"
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {getMethodIcon()}
            <span className="ml-1">
              {reminder.notification_method === 'both'
                ? 'Both'
                : reminder.notification_method === 'telegram'
                ? 'Telegram'
                : 'Email'}
            </span>
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium capitalize">
            {reminder.message_tone}
          </Badge>
          {reminder.skip_weekends && (
            <Badge variant="secondary" className="text-xs font-medium">
              No weekends
            </Badge>
          )}
        </div>

        {/* Next Scheduled */}
        {!reminder.is_paused && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{nextScheduledText}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="flex-1 h-9"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-error-600 hover:text-error-700 hover:bg-error-50 h-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
