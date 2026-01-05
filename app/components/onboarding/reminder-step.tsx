'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Check, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmojiPicker } from '@/components/emoji-picker';
import { SUGGESTED_HABITS, MIN_INTERVAL_MINUTES } from '@/lib/constants';
import { reminderSchema } from '@/lib/validations';
import { useCreateReminder } from '@/hooks/use-reminders';
import { useUpdateUser, useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

interface ReminderStepProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function ReminderStep({ onComplete, onBack, onSkip }: ReminderStepProps) {
  const { data: user } = useUser();
  const createReminder = useCreateReminder();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const [emoji, setEmoji] = useState('💧');
  const [frequencyValue, setFrequencyValue] = useState('60');
  const [frequencyUnit, setFrequencyUnit] = useState<'minutes' | 'hours'>('minutes');
  const [reminderType, setReminderType] = useState<'recurring' | 'one_time'>('recurring');
  const [scheduledFor, setScheduledFor] = useState('');

  const hasTelegram = !!user?.telegram_chat_id;
  const defaultMethod = hasTelegram ? 'both' : 'email';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ title: string; notification_method: string }>({
    defaultValues: {
      title: '',
      notification_method: defaultMethod,
    },
  });

  const notificationMethod = watch('notification_method');

  const handleSuggestedHabit = (habit: typeof SUGGESTED_HABITS[number]) => {
    setValue('title', habit.title);
    setEmoji(habit.emoji);
    setFrequencyValue(String(habit.interval));
    setFrequencyUnit('minutes');
  };

  const onSubmit = async (data: { title: string; notification_method: string }) => {
    let payload: any;

    if (reminderType === 'recurring') {
      const intervalMinutes = frequencyUnit === 'hours'
        ? parseInt(frequencyValue) * 60
        : parseInt(frequencyValue);

      payload = {
        reminder_type: 'recurring',
        title: data.title,
        emoji,
        interval_minutes: intervalMinutes,
        notification_method: data.notification_method,
        message_tone: user?.default_tone || 'friendly',
        skip_weekends: false,
        active_hours_start: undefined,
        active_hours_end: undefined,
      };
    } else {
      // One-time reminder
      payload = {
        reminder_type: 'one_time',
        title: data.title,
        emoji,
        scheduled_for: scheduledFor,
        notification_method: data.notification_method,
        message_tone: user?.default_tone || 'friendly',
      };
    }

    try {
      // Create the reminder
      await createReminder.mutateAsync(payload);

      // Mark onboarding as complete
      await updateUser.mutateAsync({ onboarding_completed: true });

      toast({
        title: 'Reminder Created!',
        description: 'Your first reminder has been set up successfully.',
        variant: 'default'
      });

      // Complete onboarding
      onComplete();
    } catch (error: any) {
      console.error('Failed to create reminder:', error);
      toast({
        title: 'Failed to Create Reminder',
        description: error.response?.data?.error || 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as complete without creating reminder
      await updateUser.mutateAsync({ onboarding_completed: true });

      toast({
        title: 'Onboarding Complete!',
        description: 'You can create reminders from the dashboard anytime.',
        variant: 'default'
      });

      // Skip to dashboard
      onSkip();
    } catch (error) {
      console.error('Failed to skip:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isPending = createReminder.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your First Reminder</h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          Let's set up a reminder to help you build a healthy habit
        </p>
      </div>

      {/* Suggested Habits */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Quick Start (Optional)
        </Label>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {SUGGESTED_HABITS.map((habit) => (
            <button
              key={habit.title}
              type="button"
              onClick={() => handleSuggestedHabit(habit)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left min-h-[44px]"
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{habit.title}</p>
                <p className="text-xs text-gray-500">Every {habit.interval} min</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Reminder Title <span className="text-error-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Drink water, Take a break"
              className="h-11"
              {...register('title', { required: true })}
            />
            {errors.title && (
              <p className="text-sm text-error-500">Title is required</p>
            )}
          </div>

          {/* Emoji */}
          <EmojiPicker value={emoji} onChange={setEmoji} />

          {/* Reminder Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Reminder Type
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant={reminderType === 'recurring' ? 'default' : 'outline'}
                onClick={() => setReminderType('recurring')}
                className="h-11 sm:h-12 text-xs sm:text-sm min-h-[44px]"
              >
                <Clock className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Recurring
              </Button>
              <Button
                type="button"
                variant={reminderType === 'one_time' ? 'default' : 'outline'}
                onClick={() => setReminderType('one_time')}
                className="h-11 sm:h-12 text-xs sm:text-sm min-h-[44px]"
              >
                <Calendar className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                One-Time
              </Button>
            </div>
          </div>

          {/* Conditional Fields Based on Reminder Type */}
          {reminderType === 'recurring' ? (
            /* Frequency */
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <div className="xs:col-span-2 space-y-2">
              <Label htmlFor="frequency-value" className="text-sm font-medium text-gray-700">
                Frequency <span className="text-error-500">*</span>
              </Label>
              <Input
                id="frequency-value"
                type="number"
                placeholder="Enter frequency"
                className="h-11"
                min={frequencyUnit === 'minutes' ? String(MIN_INTERVAL_MINUTES) : '1'}
                max={frequencyUnit === 'minutes' ? '1440' : '24'}
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency-unit" className="text-sm font-medium text-gray-700">Unit</Label>
              <Select value={frequencyUnit} onValueChange={(v) => setFrequencyUnit(v as any)}>
                <SelectTrigger id="frequency-unit" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
          ) : (
            /* One-Time Reminder */
            <div className="space-y-2">
              <Label htmlFor="scheduled-for" className="text-sm font-medium text-gray-700">
                Schedule For <span className="text-error-500">*</span>
              </Label>
              <Input
                id="scheduled-for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="h-11"
                required
              />
              <p className="text-xs text-gray-500">
                Select when you want to receive this reminder
              </p>
            </div>
          )}

          {/* Notification Method */}
          <div className="space-y-2">
            <Label htmlFor="notification-method" className="text-sm font-medium text-gray-700">
              Notification Method
            </Label>
            <Select
              value={notificationMethod}
              onValueChange={(v) => setValue('notification_method', v)}
              disabled={!hasTelegram}
            >
              <SelectTrigger id="notification-method" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                {hasTelegram && (
                  <>
                    <SelectItem value="telegram">Telegram Only</SelectItem>
                    <SelectItem value="both">Telegram & Email</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {!hasTelegram && (
              <p className="text-xs text-gray-500">
                Connect Telegram from Settings to enable Telegram notifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="sm:flex-1"
          size="lg"
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSkip}
          variant="ghost"
          className="sm:flex-1"
          size="lg"
          disabled={isPending}
        >
          Skip for Now
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="sm:flex-1"
          size="lg"
        >
          {isPending ? 'Creating...' : 'Create Reminder'}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-2">
        You can always create reminders later from the dashboard
      </p>
    </form>
  );
}
