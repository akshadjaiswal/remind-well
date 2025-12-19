'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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

  const [emoji, setEmoji] = useState(reminder?.emoji || '🔔');
  const [frequencyValue, setFrequencyValue] = useState(
    reminder ? String(reminder.interval_minutes >= 60 ? reminder.interval_minutes / 60 : reminder.interval_minutes) : '30'
  );
  const [frequencyUnit, setFrequencyUnit] = useState<'minutes' | 'hours'>(
    reminder && reminder.interval_minutes >= 60 ? 'hours' : 'minutes'
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
    const intervalMinutes = frequencyUnit === 'hours'
      ? parseInt(frequencyValue) * 60
      : parseInt(frequencyValue);

    const payload: any = {
      title: data.title,
      emoji,
      interval_minutes: intervalMinutes,
      notification_method: notificationMethod,
      message_tone: messageTone,
      skip_weekends: skipWeekends,
      active_hours_start: useActiveHours ? activeHoursStart : null,
      active_hours_end: useActiveHours ? activeHoursEnd : null,
    };

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Reminder Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Drink water, Take a break"
              {...register('title', { required: true })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">Title is required</p>
            )}
          </div>

          <EmojiPicker value={emoji} onChange={setEmoji} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency-value">
                Frequency <span className="text-red-500">*</span>
              </Label>
              <Input
                id="frequency-value"
                type="number"
                min={frequencyUnit === 'minutes' ? '15' : '1'}
                max={frequencyUnit === 'minutes' ? '1440' : '24'}
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency-unit">Unit</Label>
              <Select value={frequencyUnit} onValueChange={(v) => setFrequencyUnit(v as any)}>
                <SelectTrigger id="frequency-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-method">Notification Method</Label>
            <Select value={notificationMethod} onValueChange={(v) => setNotificationMethod(v as any)}>
              <SelectTrigger id="notification-method">
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
            <Label htmlFor="message-tone">Message Tone</Label>
            <Select value={messageTone} onValueChange={(v) => setMessageTone(v as any)}>
              <SelectTrigger id="message-tone">
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

      <Card>
        <CardHeader>
          <CardTitle>Schedule Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-active-hours"
              checked={useActiveHours}
              onCheckedChange={(checked) => setUseActiveHours(checked as boolean)}
            />
            <Label htmlFor="use-active-hours" className="cursor-pointer">
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
            <Label htmlFor="skip-weekends" className="cursor-pointer">
              Skip weekends (no reminders on Saturday and Sunday)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? 'Saving...' : mode === 'create' ? 'Create Reminder' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
