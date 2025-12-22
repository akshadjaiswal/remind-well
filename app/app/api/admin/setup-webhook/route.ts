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
            hint: 'Provide URL via query parameter: /api/admin/setup-webhook?url=https://your-ngrok-url.ngrok-free.app/api/telegram/webhook'
          },
          { status: 400 }
        );
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

    return NextResponse.json({
      success: true,
      message: 'Webhook configured successfully',
      webhook_url: webhookUrl,
      status: info
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
