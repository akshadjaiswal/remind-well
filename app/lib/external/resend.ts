// Resend email client

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param message - Plain text message content
 * @returns Resend email ID
 */
export async function sendEmail(
  to: string,
  subject: string,
  message: string
): Promise<{ id: string }> {
  try {
    // In development, Resend only allows sending to the account owner's email
    // Use the development email override if in development mode
    const recipientEmail = process.env.NODE_ENV === 'development'
      ? (process.env.RESEND_DEV_EMAIL || to)
      : to;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'RemindWell <reminders@resend.dev>',
      to: [recipientEmail],
      subject,
      html: generateEmailTemplate(subject, message)
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from Resend');
    }

    return { id: data.id };
  } catch (error: any) {
    console.error('Resend error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Generate HTML email template
 * @param subject - Email subject
 * @param message - Message content
 * @returns HTML string
 */
function generateEmailTemplate(subject: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          .message {
            font-size: 18px;
            line-height: 1.8;
            color: #1f2937;
            margin: 0 0 30px 0;
            text-align: center;
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: #3B82F6;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RemindWell</h1>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
            <p class="message">${message}</p>
          </div>
          <div class="footer">
            <p>You're receiving this because you set up a reminder in RemindWell.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage your reminders</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
