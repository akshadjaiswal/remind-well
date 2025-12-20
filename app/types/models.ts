// Application models with computed properties

import { DbUser, DbReminder, DbNotification, DbStats } from './database.types';

export interface User extends DbUser {
  // Computed properties
  hasTelegram: boolean;
}

export interface Reminder extends DbReminder {
  // Computed properties
  frequencyText: string; // "Every 30 minutes" or "Every 2 hours"
  nextScheduledText: string; // "In 15 minutes" or "Tomorrow at 9 AM"
  canToggle: boolean;
}

export interface Notification extends DbNotification {}

export interface DailyStats extends DbStats {}

export interface DashboardStats {
  activeReminders: number;
  pausedReminders: number;
  todaysSent: number;
  totalReminders: number;
}
