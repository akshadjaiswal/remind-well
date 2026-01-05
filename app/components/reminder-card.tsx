'use client';

import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Clock, Mail, MessageSquare, Pause, Play, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToggleReminder } from '@/hooks/use-reminders';
import { useUIStore } from '@/lib/stores/ui-store';
import type { Reminder } from '@/types/models';
import { formatDistanceToNow, format } from 'date-fns';
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

  const nextScheduledText = reminder.reminder_type === 'one_time' && reminder.scheduled_for
    ? `Fires ${formatDistanceToNow(new Date(reminder.scheduled_for), { addSuffix: true })}`
    : reminder.next_scheduled_at
      ? formatDistanceToNow(new Date(reminder.next_scheduled_at), { addSuffix: true })
      : 'Not scheduled';

  const frequencyDisplay = reminder.reminder_type === 'one_time' && reminder.scheduled_for
    ? `Scheduled for ${format(new Date(reminder.scheduled_for), 'PPp')}`
    : reminder.frequencyText;

  const isOneTime = reminder.reminder_type === 'one_time';

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
            <div className="text-3xl sm:text-4xl flex-shrink-0">{reminder.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                {reminder.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{frequencyDisplay}</p>
            </div>
          </div>
          <Button
            variant={reminder.is_paused ? "outline" : "secondary"}
            size="sm"
            onClick={handleToggle}
            disabled={toggleMutation.isPending || isOneTime}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 flex-shrink-0 h-9 sm:h-10 min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm",
              reminder.is_paused && "border-primary-300 text-primary-700 hover:bg-primary-50",
              isOneTime && "cursor-not-allowed"
            )}
          >
            {isOneTime ? (
              <span className="text-xs">Scheduled</span>
            ) : reminder.is_paused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isOneTime ? "default" : "secondary"} className="text-xs font-medium">
            {isOneTime ? 'One-Time' : 'Recurring'}
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1">
            {getMethodIcon()}
            <span className="ml-0.5 sm:ml-1 truncate max-w-[80px] sm:max-w-none">
              {reminder.notification_method === 'both'
                ? 'Both'
                : reminder.notification_method === 'telegram'
                ? 'Telegram'
                : 'Email'}
            </span>
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium capitalize truncate">
            {reminder.message_tone}
          </Badge>
          {!isOneTime && reminder.skip_weekends && (
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
            className="flex-1 min-h-[44px] h-10 sm:h-9 text-xs sm:text-sm"
          >
            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
            <span className="hidden xs:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-error-600 hover:text-error-700 hover:bg-error-50 min-h-[44px] h-10 sm:h-9 min-w-[44px] px-3 sm:px-4"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
