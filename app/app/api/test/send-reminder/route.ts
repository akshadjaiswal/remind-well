// TEST API: GET /api/test/send-reminder?reminderId=<uuid>
// Development-only endpoint to test Telegram sending without waiting for cron schedule

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateReminderMessage } from '@/lib/external/groq';
import { sendTelegramMessage } from '@/lib/external/telegram';
import { calculateHoursSince } from '@/lib/scheduling';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('reminderId');

    if (!reminderId) {
      return NextResponse.json(
        { error: 'Missing reminderId query parameter. Usage: /api/test/send-reminder?reminderId=<uuid>' },
        { status: 400 }
      );
    }

    console.log(`[TEST] Fetching reminder ${reminderId}`);

    // Fetch the reminder with user details
    const { data: reminder, error: fetchError } = await supabase
      .from('rw_reminders')
      .select(`
        *,
        rw_users!inner (
          id,
          email,
          telegram_chat_id,
          telegram_username,
          timezone
        )
      `)
      .eq('id', reminderId)
      .single();

    if (fetchError || !reminder) {
      return NextResponse.json(
        { error: 'Reminder not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    const user = Array.isArray(reminder.rw_users) ? reminder.rw_users[0] : reminder.rw_users;

    // Generate AI message
    console.log(`[TEST] Generating AI message for "${reminder.title}" with tone "${reminder.message_tone}"`);
    const hoursSince = calculateHoursSince(reminder.last_sent_at);
    let message: string;

    try {
      message = await generateReminderMessage(reminder.title, reminder.message_tone, hoursSince);
    } catch (error: any) {
      console.error('[TEST] AI generation failed, using fallback:', error.message);
      message = `${reminder.emoji} ${reminder.title}`;
    }

    const results: any = {
      success: true,
      reminder: {
        id: reminder.id,
        title: reminder.title,
        emoji: reminder.emoji,
        notification_method: 'telegram'
      },
      user: {
        email: user.email,
        telegram_chat_id: user.telegram_chat_id,
        telegram_username: user.telegram_username
      },
      message,
      notifications: []
    };

    // Send Telegram notification
    try {
      if (!user.telegram_chat_id) {
        results.notifications.push({
          method: 'telegram',
          status: 'skipped',
          reason: 'User has not connected Telegram account'
        });
      } else {
        const result = await sendTelegramMessage(user.telegram_chat_id, `${reminder.emoji} ${message}`);
        console.log(`[TEST] Sent Telegram message to ${user.telegram_chat_id}`);

        results.notifications.push({
          method: 'telegram',
          status: 'sent',
          chat_id: user.telegram_chat_id,
          message_id: result.message_id
        });
      }
    } catch (error: any) {
      console.error(`[TEST] Failed to send Telegram:`, error.message);

      results.notifications.push({
        method: 'telegram',
        status: 'failed',
        error: error.message
      });
    }

    results.sentAt = new Date().toISOString();

    console.log('[TEST] Completed:', results);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[TEST] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
