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
    if (text.startsWith('/start')) {
      // Extract token from command: "/start abc123token"
      const parts = text.split(' ');
      const token = parts[1] || null;

      if (!token) {
        await sendTelegramMessage(
          chatId,
          'Please use the link from RemindWell app to connect your account.'
        );
        return NextResponse.json({ ok: true });
      }

      // Find user by token
      const { data: user, error } = await supabase
        .from('rw_users')
        .select('id, telegram_connect_token_expires_at')
        .eq('telegram_connect_token', token)
        .is('telegram_chat_id', null)  // Not already connected
        .single();

      if (!user) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid or expired connection link. Please generate a new one from RemindWell.'
        );
        return NextResponse.json({ ok: true });
      }

      // Check token expiration
      const isExpired = user.telegram_connect_token_expires_at
        ? new Date(user.telegram_connect_token_expires_at) < new Date()
        : true;

      if (isExpired) {
        await sendTelegramMessage(
          chatId,
          '❌ This connection link has expired. Please generate a new one from RemindWell.'
        );
        return NextResponse.json({ ok: true });
      }

      // Update user with telegram data and clear token
      const { error: updateError } = await supabase
        .from('rw_users')
        .update({
          telegram_chat_id: chatId,
          telegram_username: username,
          telegram_connect_token: null,  // Clear token after use
          telegram_connect_token_expires_at: null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[Telegram Webhook] Update error:', updateError);
        await sendTelegramMessage(
          chatId,
          '❌ Error connecting your account. Please try again.'
        );
        return NextResponse.json({ ok: true });
      }

      console.log(`[Telegram Webhook] User ${user.id} connected successfully`);

      await sendTelegramMessage(
        chatId,
        '✅ Connected! You\'re all set to receive reminders.\n\nGo back to RemindWell and continue with the setup!'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return ok to Telegram
  }
}
