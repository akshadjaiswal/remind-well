// Zod validation schemas

import { z } from 'zod';
import { MIN_INTERVAL_MINUTES } from './constants';

// Base schema for common fields
const baseReminderSchema = {
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  emoji: z.string().max(10).optional().default('🔔'),
  notification_method: z.literal('telegram', {
    errorMap: () => ({ message: 'Only Telegram notifications are supported' })
  }),
  message_tone: z.enum(['motivational', 'friendly', 'direct', 'funny']).optional().default('friendly')
};

// Recurring reminder schema
const recurringReminderSchema = z.object({
  ...baseReminderSchema,
  reminder_type: z.literal('recurring').optional().default('recurring'),
  interval_minutes: z.number()
    .min(MIN_INTERVAL_MINUTES, `Minimum interval is ${MIN_INTERVAL_MINUTES} minutes`)
    .max(1440, 'Maximum interval is 24 hours'),
  active_hours_start: z.union([z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'), z.null()]).optional(),
  active_hours_end: z.union([z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'), z.null()]).optional(),
  skip_weekends: z.boolean().optional().default(false)
}).refine(
  (data) => {
    // Both start and end must be provided together, or neither
    if (data.active_hours_start && !data.active_hours_end) return false;
    if (!data.active_hours_start && data.active_hours_end) return false;
    return true;
  },
  { message: 'Both start and end times required for active hours', path: ['active_hours_start'] }
);

// One-time reminder schema
const oneTimeReminderSchema = z.object({
  ...baseReminderSchema,
  reminder_type: z.literal('one_time'),
  scheduled_for: z.string().refine(
    (val) => {
      const date = new Date(val);
      return date > new Date();
    },
    { message: 'Scheduled time must be in the future' }
  )
});

// Union of both schemas
export const reminderSchema = z.union([recurringReminderSchema, oneTimeReminderSchema]);

export const updateUserSchema = z.object({
  telegram_chat_id: z.string().optional(),
  telegram_username: z.string().optional(),
  telegram_connect_token: z.string().nullable().optional(),
  telegram_connect_token_expires_at: z.string().nullable().optional(),
  default_tone: z.enum(['motivational', 'friendly', 'direct', 'funny']).optional(),
  timezone: z.string().optional(),
  onboarding_completed: z.boolean().optional()
});

export const telegramWebhookSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      first_name: z.string(),
      username: z.string().optional()
    }),
    chat: z.object({
      id: z.number()
    }),
    text: z.string().optional()
  }).optional()
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type TelegramWebhookData = z.infer<typeof telegramWebhookSchema>;
