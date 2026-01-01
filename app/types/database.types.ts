// Database types matching exact Supabase schema

export type MessageTone = 'motivational' | 'friendly' | 'direct' | 'funny';
export type NotificationMethod = 'telegram' | 'email' | 'both';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type ReminderType = 'recurring' | 'one_time';

export interface DbUser {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  telegram_connect_token: string | null;
  telegram_connect_token_expires_at: string | null;
  default_tone: MessageTone;
  timezone: string;
  onboarding_completed: boolean;
}

export interface DbReminder {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  emoji: string;
  reminder_type: ReminderType; // 'recurring' or 'one_time'
  interval_minutes: number | null; // Nullable for one-time reminders
  scheduled_for: string | null; // Exact datetime for one-time reminders (UTC)
  archived_at: string | null; // Soft-delete timestamp
  notification_method: NotificationMethod;
  message_tone: MessageTone;
  active_hours_start: string | null; // HH:MM:SS format
  active_hours_end: string | null;
  skip_weekends: boolean;
  is_active: boolean;
  is_paused: boolean;
  last_sent_at: string | null;
  next_scheduled_at: string | null;
}

export interface DbNotification {
  id: string;
  created_at: string;
  reminder_id: string;
  user_id: string;
  message: string;
  method: 'telegram' | 'email';
  status: NotificationStatus;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  external_id: string | null;
}

export interface DbStats {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  reminders_sent: number;
}
