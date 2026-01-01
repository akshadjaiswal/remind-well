'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Info, Bell, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmojiPicker } from './emoji-picker';
import { TimePicker } from './time-picker';
import { reminderSchema } from '@/lib/validations';
import { MIN_INTERVAL_MINUTES } from '@/lib/constants';
import { useCreateReminder, useUpdateReminder } from '@/hooks/use-reminders';
import type { Reminder } from '@/types/models';
import type { CreateReminderRequest } from '@/types/api.types';

interface ReminderFormProps {
  reminder?: Reminder;
  mode: 'create' | 'edit';
}

export function ReminderForm({ reminder, mode }: ReminderFormProps) {
  const router = useRouter();
  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();

  const [reminderType, setReminderType] = useState<'recurring' | 'one_time'>(
    reminder?.reminder_type || 'recurring'
  );
  const [scheduledDateTime, setScheduledDateTime] = useState(
    reminder?.scheduled_for
      ? new Date(reminder.scheduled_for).toISOString().slice(0, 16)
      : ''
  );
  const [emoji, setEmoji] = useState(reminder?.emoji || '🔔');
  const [frequencyValue, setFrequencyValue] = useState(
    reminder ? String(reminder.interval_minutes && reminder.interval_minutes >= 60 ? reminder.interval_minutes / 60 : reminder.interval_minutes || 30) : '30'
  );
  const [frequencyUnit, setFrequencyUnit] = useState<'minutes' | 'hours'>(
    reminder && reminder.interval_minutes && reminder.interval_minutes >= 60 ? 'hours' : 'minutes'
  );
  const [notificationMethod, setNotificationMethod] = useState(reminder?.notification_method || 'both');
  const [messageTone, setMessageTone] = useState(reminder?.message_tone || 'friendly');
  const [activeHoursStart, setActiveHoursStart] = useState(reminder?.active_hours_start || '');
  const [activeHoursEnd, setActiveHoursEnd] = useState(reminder?.active_hours_end || '');
  const [skipWeekends, setSkipWeekends] = useState(reminder?.skip_weekends || false);
  const [useActiveHours, setUseActiveHours] = useState(
    !!(reminder?.active_hours_start && reminder?.active_hours_end)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ title: string }>({
    defaultValues: {
      title: reminder?.title || '',
    },
  });

  const onSubmit = async (data: { title: string }) => {
    let payload: any;

    if (reminderType === 'recurring') {
      const intervalMinutes = frequencyUnit === 'hours'
        ? parseInt(frequencyValue) * 60
        : parseInt(frequencyValue);

      payload = {
        reminder_type: 'recurring' as const,
        title: data.title,
        emoji,
        interval_minutes: intervalMinutes,
        notification_method: notificationMethod,
        message_tone: messageTone,
        skip_weekends: skipWeekends,
        active_hours_start: useActiveHours ? activeHoursStart : null,
        active_hours_end: useActiveHours ? activeHoursEnd : null,
      };
    } else {
      // One-time reminder
      payload = {
        reminder_type: 'one_time' as const,
        title: data.title,
        emoji,
        scheduled_for: new Date(scheduledDateTime).toISOString(),
        notification_method: notificationMethod,
        message_tone: messageTone,
      };
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (reminder) {
        await updateMutation.mutateAsync({ id: reminder.id, data: payload });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutation = mode === 'create' ? createMutation : updateMutation;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Visual Progress Steps */}
      <div className="mb-8 flex items-center justify-between max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            1
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">Basics</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-2 sm:mx-4" />

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            2
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">Notifications</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-2 sm:mx-4" />

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            3
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">Schedule</span>
        </div>
      </div>

      {/* Type Selector Card */}
      <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-all duration-200">
        <CardContent className="pt-6 pb-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Reminder Type <span className="text-error-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={reminderType === 'recurring' ? 'default' : 'outline'}
                className="h-24 flex flex-col gap-2 items-center justify-center transition-all"
                onClick={() => setReminderType('recurring')}
              >
                <Clock className="h-6 w-6" />
                <div className="flex flex-col items-center">
                  <span className="font-semibold">Recurring</span>
                  <span className="text-xs opacity-80">Repeats on schedule</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={reminderType === 'one_time' ? 'default' : 'outline'}
                className="h-24 flex flex-col gap-2 items-center justify-center transition-all"
                onClick={() => setReminderType('one_time')}
              >
                <Calendar className="h-6 w-6" />
                <div className="flex flex-col items-center">
                  <span className="font-semibold">One-Time</span>
                  <span className="text-xs opacity-80">Fires once, then archives</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 1: Basic Information */}
      <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-all duration-200">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-primary-50/50 via-purple-50/30 to-transparent pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900">Basic Information</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Set up your reminder title and {reminderType === 'recurring' ? 'frequency' : 'scheduled time'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Reminder Title <span className="text-error-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Drink water, Take a break"
              className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors"
              {...register('title', { required: true })}
            />
            {errors.title && (
              <p className="text-sm text-error-500">Title is required</p>
            )}
          </div>

          <EmojiPicker value={emoji} onChange={setEmoji} />

          {reminderType === 'recurring' ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="frequency-value" className="text-sm font-medium text-gray-700">
                  Frequency <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="frequency-value"
                  type="number"
                  placeholder="Enter frequency"
                  className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors"
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
                  <SelectTrigger id="frequency-unit" className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors">
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
            <div className="space-y-2">
              <Label htmlFor="scheduled-datetime" className="text-sm font-medium text-gray-700">
                Send Date & Time <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  id="scheduled-datetime"
                  type="datetime-local"
                  className="h-11 pl-10 hover:border-primary-300 focus:border-primary-500 transition-colors"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Time will be sent in your local timezone
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Notification Settings */}
      <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-all duration-200">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-success-50/50 via-emerald-50/30 to-transparent pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 text-white flex items-center justify-center shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900">Notification Settings</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Choose how and when to receive reminders</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="notification-method" className="text-sm font-medium text-gray-700">Notification Method</Label>
            <Select value={notificationMethod} onValueChange={(v) => setNotificationMethod(v as any)}>
              <SelectTrigger id="notification-method" className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="both">Telegram & Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-tone" className="text-sm font-medium text-gray-700">Message Tone</Label>
            <Select value={messageTone} onValueChange={(v) => setMessageTone(v as any)}>
              <SelectTrigger id="message-tone" className="h-11 hover:border-primary-300 focus:border-primary-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motivational">Motivational</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Schedule Options - Only for recurring reminders */}
      {reminderType === 'recurring' && (
        <Card className="border-gray-200 shadow-soft hover:shadow-medium transition-all duration-200">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-info-50/50 via-sky-50/30 to-transparent pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-info-500 to-info-600 text-white flex items-center justify-center shadow-sm">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900">Schedule Options</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Customize when reminders are active</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-active-hours"
                checked={useActiveHours}
                onCheckedChange={(checked) => setUseActiveHours(checked as boolean)}
              />
              <Label htmlFor="use-active-hours" className="cursor-pointer text-sm text-gray-700">
                Set active hours (only send reminders during specific times)
              </Label>
            </div>

            {useActiveHours && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <TimePicker
                  label="Start Time"
                  value={activeHoursStart}
                  onChange={setActiveHoursStart}
                  required={useActiveHours}
                />
                <TimePicker
                  label="End Time"
                  value={activeHoursEnd}
                  onChange={setActiveHoursEnd}
                  required={useActiveHours}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-weekends"
                checked={skipWeekends}
                onCheckedChange={(checked) => setSkipWeekends(checked as boolean)}
              />
              <Label htmlFor="skip-weekends" className="cursor-pointer text-sm text-gray-700">
                Skip weekends (no reminders on Saturday and Sunday)
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 sm:flex-initial sm:min-w-[140px] h-11 hover:bg-gray-50"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          loading={mutation.isPending}
          className="flex-1 sm:flex-initial sm:min-w-[140px] h-11 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-sm"
        >
          {mutation.isPending ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Reminder' : 'Update Reminder')}
        </Button>
      </div>
    </form>
  );
}
