import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/external/telegram';

/**
 * POST /api/telegram/test
 * Send a welcome/test message to verify Telegram connection
 * Used during onboarding after user connects Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Telegram chat ID
    const { data: profile, error: profileError } = await supabase
      .from('rw_users')
      .select('telegram_chat_id, telegram_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (!profile.telegram_chat_id) {
      return NextResponse.json(
        { error: 'Telegram not connected. Please connect your Telegram account first.' },
        { status: 400 }
      );
    }

    // Send welcome/test message
    const message = `🎉 Welcome to RemindWell!

Your Telegram is successfully connected. You'll receive your reminders here.

Let's create your first reminder to get started! 💪`;

    const result = await sendTelegramMessage(profile.telegram_chat_id, message);

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully',
      message_id: result.message_id
    });

  } catch (error: any) {
    console.error('[Telegram Test] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test message' },
      { status: 500 }
    );
  }
}
