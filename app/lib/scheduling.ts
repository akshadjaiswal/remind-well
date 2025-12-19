// Critical scheduling logic for RemindWell

import { addMinutes, isWeekend, setHours, setMinutes, addDays, startOfDay, getDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Calculate the next scheduled time for a reminder
 * Handles timezones, active hours, and weekend skipping
 */
export function calculateNextScheduledAt(
  intervalMinutes: number,
  timezone: string = 'UTC',
  activeHoursStart?: string | null,
  activeHoursEnd?: string | null,
  skipWeekends?: boolean
): Date {
  let next = addMinutes(new Date(), intervalMinutes);

  // Convert to user's timezone
  next = toZonedTime(next, timezone);

  // Check and handle weekends
  if (skipWeekends && isWeekend(next)) {
    next = getNextWeekday(next);
    // If there are active hours, set to start time on Monday
    if (activeHoursStart) {
      next = setTimeToHour(next, activeHoursStart);
    }
  }

  // Check and adjust for active hours
  if (activeHoursStart && activeHoursEnd) {
    next = adjustForActiveHours(next, activeHoursStart, activeHoursEnd, skipWeekends || false);
  }

  // Convert back to UTC for storage
  return fromZonedTime(next, timezone);
}

/**
 * Check if a given time is within active hours
 */
export function isWithinActiveHours(
  date: Date,
  timezone: string,
  activeHoursStart?: string | null,
  activeHoursEnd?: string | null
): boolean {
  if (!activeHoursStart || !activeHoursEnd) return true;

  const zonedDate = toZonedTime(date, timezone);
  const hours = zonedDate.getHours();
  const minutes = zonedDate.getMinutes();
  const currentTime = hours * 60 + minutes;

  const [startH, startM] = activeHoursStart.split(':').map(Number);
  const [endH, endM] = activeHoursEnd.split(':').map(Number);
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Get the next weekday (Monday) from a weekend date
 */
function getNextWeekday(date: Date): Date {
  const day = getDay(date);
  if (day === 6) return addDays(startOfDay(date), 2); // Saturday -> Monday
  if (day === 0) return addDays(startOfDay(date), 1); // Sunday -> Monday
  return date;
}

/**
 * Set time to a specific hour (HH:MM format)
 */
function setTimeToHour(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return setMinutes(setHours(date, hours), minutes);
}

/**
 * Adjust scheduled time to fit within active hours
 * If outside active hours, move to next valid time
 */
function adjustForActiveHours(
  date: Date,
  startTime: string,
  endTime: string,
  skipWeekends: boolean
): Date {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Before active hours - set to start time
  if (hours < startH || (hours === startH && minutes < startM)) {
    return setMinutes(setHours(date, startH), startM);
  }

  // After active hours - set to next day start time
  if (hours > endH || (hours === endH && minutes > endM)) {
    let nextDay = addDays(startOfDay(date), 1);

    // If next day is weekend and we skip weekends, move to Monday
    if (skipWeekends && isWeekend(nextDay)) {
      nextDay = getNextWeekday(nextDay);
    }

    return setMinutes(setHours(nextDay, startH), startM);
  }

  // Within active hours
  return date;
}

/**
 * Calculate hours since last reminder (for AI context)
 */
export function calculateHoursSince(lastSentAt: string | null): number | undefined {
  if (!lastSentAt) return undefined;

  try {
    const last = new Date(lastSentAt);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return hours > 0 ? hours : undefined;
  } catch (error) {
    return undefined;
  }
}
