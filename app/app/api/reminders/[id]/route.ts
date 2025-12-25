// API: GET /api/reminders/[id] - Get single reminder
// API: PATCH /api/reminders/[id] - Update reminder
// API: DELETE /api/reminders/[id] - Delete reminder

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { reminderSchema } from '@/lib/validations';
import { calculateNextScheduledAt } from '@/lib/scheduling';
import { timeToDatabase } from '@/lib/formatting';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reminder, error } = await supabase
      .from('rw_reminders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error('GET /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminder', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Partial validation for updates
    const validated: any = body;

    // Get user's timezone
    const { data: userData } = await supabase
      .from('rw_users')
      .select('timezone')
      .eq('id', user.id)
      .single();

    const timezone = userData?.timezone || 'UTC';

    // Recalculate next scheduled time if interval or active hours changed
    let updateData: any = { ...validated };

    if (validated.interval_minutes || validated.active_hours_start !== undefined) {
      // Get current reminder data
      const { data: currentReminder } = await supabase
        .from('rw_reminders')
        .select('interval_minutes, active_hours_start, active_hours_end, skip_weekends')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (currentReminder) {
        const nextScheduledAt = calculateNextScheduledAt(
          validated.interval_minutes || currentReminder.interval_minutes,
          timezone,
          validated.active_hours_start !== undefined ? validated.active_hours_start : currentReminder.active_hours_start,
          validated.active_hours_end !== undefined ? validated.active_hours_end : currentReminder.active_hours_end,
          validated.skip_weekends !== undefined ? validated.skip_weekends : currentReminder.skip_weekends
        );
        updateData.next_scheduled_at = nextScheduledAt.toISOString();
      }
    }

    // Convert time format if provided
    if (updateData.active_hours_start) {
      updateData.active_hours_start = timeToDatabase(updateData.active_hours_start);
    }
    if (updateData.active_hours_end) {
      updateData.active_hours_end = timeToDatabase(updateData.active_hours_end);
    }

    const { data: reminder, error } = await supabase
      .from('rw_reminders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error('PATCH /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('rw_reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/reminders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder', message: error.message },
      { status: 500 }
    );
  }
}
