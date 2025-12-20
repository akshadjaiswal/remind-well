// Date and time formatting utilities

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format reminder frequency for display
 * @param minutes - Interval in minutes
 * @returns Human-readable frequency text
 */
export function formatFrequency(minutes: number): string {
  if (minutes < 60) {
    return `Every ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `Every ${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `Every ${hours}h ${remainingMinutes}m`;
}

/**
 * Format next scheduled time relative to now
 * @param date - ISO date string or Date object
 * @returns Human-readable relative time
 */
export function formatNextScheduled(date: string | Date | null): string {
  if (!date) return 'Not scheduled';

  try {
    const scheduledDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    if (scheduledDate < now) {
      return 'Overdue';
    }

    return `In ${formatDistanceToNow(scheduledDate)}`;
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format time from HH:MM:SS to HH:MM
 * @param time - Time in HH:MM:SS format
 * @returns Time in HH:MM format
 */
export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.substring(0, 5); // Extract HH:MM from HH:MM:SS
}

/**
 * Convert HH:MM to HH:MM:SS for database
 * @param time - Time in HH:MM format
 * @returns Time in HH:MM:SS format
 */
export function timeToDatabase(time: string): string {
  return `${time}:00`;
}

/**
 * Format date for display
 * @param date - ISO date string or Date object
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}
