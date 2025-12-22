// Telegram Bot API client

import axios from 'axios';
import { TelegramSendMessageResponse } from '@/types/external.types';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message via Telegram Bot
 * @param chatId - User's Telegram chat ID
 * @param text - Message text to send
 * @returns Telegram API response with message ID
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<TelegramSendMessageResponse['result']> {
  try {
    const response = await axios.post<TelegramSendMessageResponse>(
      `${TELEGRAM_API_URL}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      }
    );

    if (!response.data.ok) {
      throw new Error('Telegram API returned not ok');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Telegram send error:', error.response?.data || error.message);
    throw new Error(`Failed to send Telegram message: ${error.message}`);
  }
}

/**
 * Set Telegram webhook URL (for production)
 * @param webhookUrl - Full URL to webhook endpoint
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<void> {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
      url: webhookUrl
    });

    console.log('Webhook set:', response.data);
  } catch (error: any) {
    console.error('Webhook error:', error.response?.data || error.message);
    throw new Error('Failed to set webhook');
  }
}

/**
 * Delete Telegram webhook (for local development)
 */
export async function deleteTelegramWebhook(): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`);
    console.log('Webhook deleted');
  } catch (error: any) {
    console.error('Delete webhook error:', error.message);
    throw new Error('Failed to delete webhook');
  }
}

/**
 * Get current webhook information
 * @returns Webhook info including URL, status, and pending updates
 */
export async function getTelegramWebhookInfo(): Promise<any> {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getWebhookInfo`);
    return response.data;
  } catch (error: any) {
    console.error('Get webhook info error:', error.message);
    throw new Error('Failed to get webhook info');
  }
}
