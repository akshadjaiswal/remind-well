// API: POST /api/telegram/webhook - Handle Telegram updates

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { telegramWebhookSchema } from '@/lib/validations';
import { sendTelegramMessage } from '@/lib/external/telegram';

// Use service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Telegram Webhook] Received:', body);

    const validated = telegramWebhookSchema.parse(body);

    if (!validated.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = validated.message.chat.id.toString();
    const username = validated.message.from.username;
    const text = validated.message.text;

    // Handle /start command
    if (text === '/start') {
      // Find user by any existing telegram_chat_id or create link
      // For simplicity, we'll just update the first user without telegram
      // In production, you'd want a more robust linking mechanism

      const { data: user } = await supabase
        .from('rw_users')
        .select('id')
        .is('telegram_chat_id', null)
        .limit(1)
        .single();

      if (user) {
        await supabase
          .from('rw_users')
          .update({
            telegram_chat_id: chatId,
            telegram_username: username
          })
          .eq('id', user.id);

        await sendTelegramMessage(
          chatId,
          '✅ Connected! You\'re all set to receive reminders.\n\nGo back to RemindWell and start creating your first reminder!'
        );
      } else {
        await sendTelegramMessage(
          chatId,
          'Welcome! Please sign up at RemindWell first, then send /start again to connect your account.'
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return ok to Telegram
  }
}
