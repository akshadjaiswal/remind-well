// ADMIN API: POST /api/admin/setup-webhook
// Sets up the Telegram webhook URL for receiving messages

import { NextResponse } from 'next/server';
import { setTelegramWebhook, getTelegramWebhookInfo } from '@/lib/external/telegram';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let webhookUrl = searchParams.get('url');

    // Use app URL from env if not provided
    if (!webhookUrl) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

      if (!appUrl) {
        return NextResponse.json(
          {
            error: 'No webhook URL provided and no NEXT_PUBLIC_APP_URL or VERCEL_URL found',
            hint: 'Provide URL via query parameter: /api/admin/setup-webhook?url=https://your-app.vercel.app/api/telegram/webhook'
          },
          { status: 400 }
        );
      }

      // Validate URL for production use
      if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
        return NextResponse.json(
          {
            error: 'Invalid app URL for production webhook',
            current_url: appUrl,
            message: 'Localhost URLs cannot be used for Telegram webhooks. Please set NEXT_PUBLIC_APP_URL to your production Vercel URL.',
            hint: 'For local testing, use ngrok and provide the URL via query parameter'
          },
          { status: 400 }
        );
      }

      // Warn about ngrok URLs but allow them
      if (appUrl.includes('ngrok')) {
        console.warn('[ADMIN] Warning: Using ngrok URL for webhook. This is temporary and will break when tunnel expires.');
      }

      // Ensure URL has protocol
      const baseUrl = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`;
      webhookUrl = `${baseUrl}/api/telegram/webhook`;
    }

    console.log(`[ADMIN] Setting webhook to: ${webhookUrl}`);

    // Set the webhook
    await setTelegramWebhook(webhookUrl);

    // Get current status to confirm
    const info = await getTelegramWebhookInfo();
    const webhookInfo = info.result || info;

    // Validate webhook was set correctly
    if (webhookInfo.url !== webhookUrl) {
      return NextResponse.json(
        {
          error: 'Webhook URL mismatch after setup',
          expected: webhookUrl,
          actual: webhookInfo.url,
          message: 'Telegram API did not confirm the webhook URL correctly'
        },
        { status: 500 }
      );
    }

    // Check for pending errors
    const hasError = webhookInfo.last_error_message;
    const pendingUpdates = webhookInfo.pending_update_count || 0;

    if (hasError) {
      console.warn('[ADMIN] Webhook has errors:', webhookInfo.last_error_message);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook configured successfully',
      webhook_url: webhookUrl,
      webhook_status: {
        url: webhookInfo.url,
        pending_updates: pendingUpdates,
        has_error: !!hasError,
        last_error: hasError || null,
        max_connections: webhookInfo.max_connections
      },
      warning: hasError ? `Webhook has previous errors: ${hasError}. New connections should work now.` : null
    });
  } catch (error: any) {
    console.error('[ADMIN] Setup webhook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup webhook',
        message: error.message,
        hint: 'Make sure TELEGRAM_BOT_TOKEN is set in environment variables'
      },
      { status: 500 }
    );
  }
}

// Also support GET for easier browser testing
export async function GET(request: Request) {
  return POST(request);
}
