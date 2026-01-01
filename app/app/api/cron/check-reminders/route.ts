// CRITICAL API: GET/POST /api/cron/check-reminders
// This is the heart of RemindWell - runs every minute via EasyCron

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateReminderMessage } from '@/lib/external/groq';
import { sendTelegramMessage } from '@/lib/external/telegram';
import { sendEmail } from '@/lib/external/resend';
import { calculateNextScheduledAt, isWithinActiveHours, calculateHoursSince } from '@/lib/scheduling';
import { isWeekend } from 'date-fns';
import { retryWithBackoff } from '@/lib/retry';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  return handleCronJob(request);
}

export async function POST(request: Request) {
  return handleCronJob(request);
}

async function handleCronJob(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const now = new Date();
    console.log(`[CRON] Starting check at ${now.toISOString()}`);

    // Fetch reminders due for notification
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
      .is('archived_at', null) // Exclude archived reminders
      .lte('next_scheduled_at', now.toISOString());

    if (error) {
      console.error('[CRON] Query error:', error);
      throw error;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const reminder of reminders || []) {
      try {
        const user = Array.isArray(reminder.rw_users) ? reminder.rw_users[0] : reminder.rw_users;

        // Skip active hours/weekend checks for one-time reminders
        // One-time reminders fire at exact scheduled time
        if (reminder.reminder_type === 'recurring') {
          // Check active hours (recurring only)
          if (!isWithinActiveHours(
            now,
            user.timezone,
            reminder.active_hours_start,
            reminder.active_hours_end
          )) {
            console.log(`[CRON] Skipping ${reminder.id} - outside active hours`);
            continue;
          }

          // Check weekends (recurring only)
          if (reminder.skip_weekends && isWeekend(now)) {
            console.log(`[CRON] Skipping ${reminder.id} - weekend`);
            continue;
          }
        } else if (reminder.reminder_type === 'one_time') {
          // Grace period check for one-time reminders
          // If scheduled time is more than 24 hours in the past, archive without sending
          const scheduledFor = new Date(reminder.scheduled_for);
          const hoursPast = (now.getTime() - scheduledFor.getTime()) / (1000 * 60 * 60);

          if (hoursPast > 24) {
            console.log(`[CRON] Archiving stale one-time reminder ${reminder.id} (${hoursPast.toFixed(1)}h past scheduled time)`);

            await supabase
              .from('rw_reminders')
              .update({
                is_active: false,
                archived_at: now.toISOString()
              })
              .eq('id', reminder.id);

            continue; // Skip sending
          }
        }

        // Generate AI message
        const hoursSince = calculateHoursSince(reminder.last_sent_at);
        let message: string;

        try {
          message = await retryWithBackoff(() =>
            generateReminderMessage(reminder.title, reminder.message_tone, hoursSince)
          );
        } catch (error) {
          console.error(`[CRON] AI generation failed for ${reminder.id}, using fallback`);
          message = `${reminder.emoji} ${reminder.title}`;
        }

        // Determine notification methods
        const methods = reminder.notification_method === 'both'
          ? ['telegram', 'email']
          : [reminder.notification_method];

        // Send notifications
        for (const method of methods) {
          try {
            let externalId = null;

            if (method === 'telegram' && user.telegram_chat_id) {
              const result = await retryWithBackoff(() =>
                sendTelegramMessage(user.telegram_chat_id, `${reminder.emoji} ${message}`)
              );
              externalId = result.message_id?.toString();

              console.log(`[CRON] Sent Telegram to ${user.telegram_chat_id} for ${reminder.id}`);
            } else if (method === 'email') {
              const result = await retryWithBackoff(() =>
                sendEmail(user.email, `${reminder.emoji} ${reminder.title}`, message)
              );
              externalId = result.id;

              console.log(`[CRON] Sent email to ${user.email} for ${reminder.id}`);
            }

            // Log successful notification
            await supabase.from('rw_notifications').insert({
              reminder_id: reminder.id,
              user_id: user.id,
              message,
              method,
              status: 'sent',
              sent_at: now.toISOString(),
              external_id: externalId
            });
          } catch (error: any) {
            console.error(`[CRON] Failed to send ${method} for ${reminder.id}:`, error.message);

            // Log failed notification
            await supabase.from('rw_notifications').insert({
              reminder_id: reminder.id,
              user_id: user.id,
              message,
              method,
              status: 'failed',
              error_message: error.message,
              retry_count: 3
            });

            failedCount++;
          }
        }

        // Post-send: Archive one-time reminders, recalculate next time for recurring
        if (reminder.reminder_type === 'one_time') {
          // One-time reminder: Archive after sending
          await supabase
            .from('rw_reminders')
            .update({
              last_sent_at: now.toISOString(),
              is_active: false,
              archived_at: now.toISOString()
            })
            .eq('id', reminder.id);

          console.log(`[CRON] Archived one-time reminder ${reminder.id} after sending`);
        } else {
          // Recurring reminder: Calculate next scheduled time
          const nextScheduledAt = calculateNextScheduledAt(
            reminder.interval_minutes,
            user.timezone,
            reminder.active_hours_start,
            reminder.active_hours_end,
            reminder.skip_weekends
          );

          await supabase
            .from('rw_reminders')
            .update({
              last_sent_at: now.toISOString(),
              next_scheduled_at: nextScheduledAt.toISOString()
            })
            .eq('id', reminder.id);
        }

        // Increment daily stats
        await supabase.rpc('increment_daily_stats', {
          p_user_id: user.id,
          p_date: now.toISOString().split('T')[0]
        });

        processedCount++;
      } catch (error: any) {
        console.error(`[CRON] Error processing reminder ${reminder.id}:`, error.message);
        failedCount++;
      }
    }

    const result = {
      success: true,
      processed: processedCount,
      failed: failedCount,
      total: reminders?.length || 0,
      timestamp: now.toISOString()
    };

    console.log('[CRON] Completed:', result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
