// ADMIN API: GET /api/admin/webhook-status
// Returns current Telegram webhook configuration and status

import { NextResponse } from 'next/server';
import { getTelegramWebhookInfo } from '@/lib/external/telegram';

export async function GET() {
  try {
    console.log('[ADMIN] Fetching webhook status...');

    const info = await getTelegramWebhookInfo();

    // Extract useful information
    const webhookInfo = info.result || info;

    return NextResponse.json({
      success: true,
      webhook: {
        url: webhookInfo.url || null,
        has_custom_certificate: webhookInfo.has_custom_certificate || false,
        pending_update_count: webhookInfo.pending_update_count || 0,
        last_error_date: webhookInfo.last_error_date || null,
        last_error_message: webhookInfo.last_error_message || null,
        max_connections: webhookInfo.max_connections || 40,
        allowed_updates: webhookInfo.allowed_updates || []
      },
      status: webhookInfo.url ? 'configured' : 'not_configured',
      message: webhookInfo.url
        ? `Webhook is configured to ${webhookInfo.url}`
        : 'No webhook configured. Run POST /api/admin/setup-webhook to configure.'
    });
  } catch (error: any) {
    console.error('[ADMIN] Get webhook status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get webhook status',
        message: error.message,
        hint: 'Make sure TELEGRAM_BOT_TOKEN is set in environment variables'
      },
      { status: 500 }
    );
  }
}
