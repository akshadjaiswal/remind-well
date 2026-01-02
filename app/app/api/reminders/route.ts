// API: GET /api/reminders - List reminders
// API: POST /api/reminders - Create reminder

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { reminderSchema } from '@/lib/validations';
import { calculateNextScheduledAt } from '@/lib/scheduling';
import { timeToDatabase } from '@/lib/formatting';
import { fromZonedTime } from 'date-fns-tz';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reminders, error} = await supabase
      .from('rw_reminders')
      .select('*')
      .eq('user_id', user.id)
      .is('archived_at', null) // Exclude archived reminders
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reminders: reminders || [] });
  } catch (error: any) {
    console.error('GET /api/reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = reminderSchema.parse(body);

    // Get user's timezone
    const { data: userData } = await supabase
      .from('rw_users')
      .select('timezone')
      .eq('id', user.id)
      .single();

    const timezone = userData?.timezone || 'UTC';

    // Build reminder data based on type
    let reminderData: any = {
      user_id: user.id,
      title: validated.title,
      emoji: validated.emoji,
      reminder_type: validated.reminder_type,
      notification_method: validated.notification_method,
      message_tone: validated.message_tone
    };

    if (validated.reminder_type === 'recurring') {
      // Recurring reminder: calculate next_scheduled_at using interval
      const nextScheduledAt = calculateNextScheduledAt(
        validated.interval_minutes,
        timezone,
        validated.active_hours_start,
        validated.active_hours_end,
        validated.skip_weekends
      );

      reminderData = {
        ...reminderData,
        interval_minutes: validated.interval_minutes,
        active_hours_start: validated.active_hours_start ? timeToDatabase(validated.active_hours_start) : null,
        active_hours_end: validated.active_hours_end ? timeToDatabase(validated.active_hours_end) : null,
        skip_weekends: validated.skip_weekends,
        next_scheduled_at: nextScheduledAt.toISOString(),
        scheduled_for: null, // Explicitly null for recurring
        archived_at: null
      };
    } else {
      // One-time reminder: convert user's local time to UTC
      const scheduledForUTC = fromZonedTime(new Date(validated.scheduled_for), timezone);

      reminderData = {
        ...reminderData,
        scheduled_for: scheduledForUTC.toISOString(),
        next_scheduled_at: scheduledForUTC.toISOString(), // Mirror for cron
        interval_minutes: null, // Explicitly null for one-time
        active_hours_start: null,
        active_hours_end: null,
        skip_weekends: false,
        archived_at: null
      };
    }

    const { data: reminder, error } = await supabase
      .from('rw_reminders')
      .insert(reminderData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder', message: error.message },
      { status: 500 }
    );
  }
}
