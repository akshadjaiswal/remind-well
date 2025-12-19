// API request/response types

import { MessageTone, NotificationMethod } from './database.types';
import { Reminder, User, DashboardStats } from './models';

// ========================================
// Reminder API Types
// ========================================

export interface CreateReminderRequest {
  title: string;
  emoji?: string;
  interval_minutes: number;
  notification_method: NotificationMethod;
  message_tone?: MessageTone;
  active_hours_start?: string; // HH:MM format
  active_hours_end?: string;
  skip_weekends?: boolean;
}

export interface UpdateReminderRequest extends Partial<CreateReminderRequest> {
  is_active?: boolean;
  is_paused?: boolean;
}

export interface ReminderResponse {
  reminder: Reminder;
}

export interface RemindersListResponse {
  reminders: Reminder[];
  total: number;
}

// ========================================
// User API Types
// ========================================

export interface UpdateUserRequest {
  telegram_chat_id?: string;
  telegram_username?: string;
  default_tone?: MessageTone;
  timezone?: string;
  onboarding_completed?: boolean;
}

export interface UserResponse {
  user: User;
}

// ========================================
// Stats API Types
// ========================================

export interface StatsResponse {
  stats: DashboardStats;
}

// ========================================
// Notification API Types
// ========================================

export interface SendTestNotificationRequest {
  reminder_id: string;
}

export interface SendTestNotificationResponse {
  success: boolean;
  message: string;
}

// ========================================
// Cron API Types
// ========================================

export interface CronResponse {
  success: boolean;
  processed: number;
  timestamp: string;
}

// ========================================
// Error Response
// ========================================

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
