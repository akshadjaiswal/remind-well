// Application-wide constants

import { MessageTone } from '@/types/database.types';

export const MESSAGE_TONES: Record<MessageTone, string> = {
  motivational: 'Motivational - Encouraging and energetic',
  friendly: 'Friendly - Warm and casual',
  direct: 'Direct - Brief and to-the-point',
  funny: 'Funny - Humorous and playful'
} as const;

export const INTERVAL_PRESETS = [
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '4 hours', minutes: 240 },
  { label: '8 hours', minutes: 480 }
] as const;

export const MIN_INTERVAL_MINUTES = 15;
export const MAX_INTERVAL_MINUTES = 1440; // 24 hours

export const DEFAULT_ACTIVE_HOURS = {
  start: '09:00',
  end: '18:00'
} as const;

export const SUGGESTED_HABITS = [
  { emoji: '💧', title: 'Drink water', interval: 60 },
  { emoji: '☕', title: 'Take a break', interval: 120 },
  { emoji: '🧘', title: 'Stretch', interval: 60 },
  { emoji: '👀', title: 'Check posture', interval: 30 }
] as const;

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
] as const;
