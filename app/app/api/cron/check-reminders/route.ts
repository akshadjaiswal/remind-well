import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateReminderMessage } from '@/lib/external/groq';
import { sendTelegramMessage } from '@/lib/external/telegram';
import { calculateNextScheduledAt, isWithinActiveHours, calculateHoursSince } from '@/lib/scheduling';
import { isWeekend } from 'date-fns';
import { retryWithBackoff } from '@/lib/retry';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TIMEOUT_MS = 8500;
const CONCURRENCY = 5;

export async function GET(request: Request) {
  return handleCronJob(request);
}

export async function POST(request: Request) {
  return handleCronJob(request);
}

// Simple concurrency limiter
function createSemaphore(limit: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= limit) {
      await new Promise<void>(resolve => queue.push(resolve));
    }
    active++;
    try {
      return await fn();
    } finally {
      active--;
      queue.shift()?.();
    }
  };
}

async function processReminder(
  reminder: any,
  now: Date,
  startTime: number
): Promise<{ skipped?: string; processed?: boolean; failed?: boolean }> {
  if (Date.now() - startTime > TIMEOUT_MS) {
    return { skipped: 'timeout' };
  }

  const user = Array.isArray(reminder.rw_users) ? reminder.rw_users[0] : reminder.rw_users;

  // Skip immediately if no delivery method available
  if (!user.telegram_chat_id) {
    console.warn(`[CRON] No Telegram chat ID for user ${user.id}, skipping ${reminder.id}`);
    return { skipped: 'no_chat_id' };
  }

  // Recurring-only checks
  if (reminder.reminder_type === 'recurring') {
    if (!isWithinActiveHours(now, user.timezone, reminder.active_hours_start, reminder.active_hours_end)) {
      console.log(`[CRON] Skipping ${reminder.id} - outside active hours`);
      return { skipped: 'active_hours' };
    }
    if (reminder.skip_weekends && isWeekend(now)) {
      console.log(`[CRON] Skipping ${reminder.id} - weekend`);
      return { skipped: 'weekend' };
    }
  } else if (reminder.reminder_type === 'one_time') {
    const scheduledFor = new Date(reminder.scheduled_for);
    const hoursPast = (now.getTime() - scheduledFor.getTime()) / (1000 * 60 * 60);

    if (hoursPast > 24) {
      console.log(`[CRON] Archiving stale one-time reminder ${reminder.id} (${hoursPast.toFixed(1)}h past)`);
      await supabase
        .from('rw_reminders')
        .update({ is_active: false, archived_at: now.toISOString() })
        .eq('id', reminder.id);
      return { skipped: 'stale' };
    }
  }

  // Generate AI message — maxRetries=1 to avoid long backoff waits in cron
  let message: string;
  try {
    const hoursSince = calculateHoursSince(reminder.last_sent_at);
    message = await retryWithBackoff(
      () => generateReminderMessage(reminder.title, reminder.message_tone, hoursSince),
      1
    );
  } catch {
    console.error(`[CRON] AI generation failed for ${reminder.id}, using fallback`);
    message = `${reminder.emoji} ${reminder.title}`;
  }

  // Send Telegram
  try {
    const result = await retryWithBackoff(
      () => sendTelegramMessage(user.telegram_chat_id, `${reminder.emoji} ${message}`),
      2
    );
    const externalId = result.message_id?.toString();
    console.log(`[CRON] Sent Telegram to ${user.telegram_chat_id} for ${reminder.id}`);

    // Log notification
    await supabase.from('rw_notifications').insert({
      reminder_id: reminder.id,
      user_id: user.id,
      message,
      method: 'telegram',
      status: 'sent',
      sent_at: now.toISOString(),
      external_id: externalId
    });
  } catch (error: any) {
    console.error(`[CRON] Failed to send Telegram for ${reminder.id}:`, error.message);
    await supabase.from('rw_notifications').insert({
      reminder_id: reminder.id,
      user_id: user.id,
      message,
      method: 'telegram',
      status: 'failed',
      error_message: error.message,
      retry_count: 2
    });
    return { failed: true };
  }

  // Post-send update
  if (reminder.reminder_type === 'one_time') {
    const { error } = await supabase
      .from('rw_reminders')
      .update({ last_sent_at: now.toISOString(), is_active: false, archived_at: now.toISOString() })
      .eq('id', reminder.id);

    if (error) {
      console.error(`[CRON] Failed to archive one-time reminder ${reminder.id}:`, error);
      return { failed: true };
    }
    console.log(`[CRON] Archived one-time reminder ${reminder.id}`);
  } else {
    const nextScheduledAt = calculateNextScheduledAt(
      reminder.interval_minutes,
      user.timezone,
      reminder.active_hours_start,
      reminder.active_hours_end,
      reminder.skip_weekends
    );

    const { error } = await supabase
      .from('rw_reminders')
      .update({ last_sent_at: now.toISOString(), next_scheduled_at: nextScheduledAt.toISOString() })
      .eq('id', reminder.id);

    if (error) {
      console.error(`[CRON] Failed to update recurring reminder ${reminder.id}:`, error);
      return { failed: true };
    }
    console.log(`[CRON] Updated recurring reminder ${reminder.id}, next at ${nextScheduledAt.toISOString()}`);
  }

  // Increment daily stats
  await supabase.rpc('increment_daily_stats', {
    p_user_id: user.id,
    p_date: now.toISOString().split('T')[0]
  });

  return { processed: true };
}

async function handleCronJob(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const now = new Date();
    const startTime = Date.now();
    console.log(`[CRON] Starting check at ${now.toISOString()}`);

    const { data: reminders, error } = await supabase
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
      .eq('is_active', true)
      .eq('is_paused', false)
      .is('archived_at', null)
      .lte('next_scheduled_at', now.toISOString());

    if (error) {
      console.error('[CRON] Query error:', error);
      throw error;
    }

    const total = reminders?.length || 0;
    if (total === 0) {
      console.log('[CRON] No reminders due');
      return NextResponse.json({ success: true, processed: 0, failed: 0, total: 0, timestamp: now.toISOString() });
    }

    console.log(`[CRON] Processing ${total} reminders (concurrency=${CONCURRENCY})`);

    const sem = createSemaphore(CONCURRENCY);
    const results = await Promise.allSettled(
      reminders!.map(reminder => sem(() => processReminder(reminder, now, startTime)))
    );

    let processedCount = 0;
    let failedCount = 0;
    for (const r of results) {
      if (r.status === 'fulfilled') {
        if (r.value.processed) processedCount++;
        else if (r.value.failed) failedCount++;
      } else {
        failedCount++;
      }
    }

    const result = {
      success: true,
      processed: processedCount,
      failed: failedCount,
      total,
      elapsed_ms: Date.now() - startTime,
      timestamp: now.toISOString()
    };

    console.log('[CRON] Completed:', result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', message: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
