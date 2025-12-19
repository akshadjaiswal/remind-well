// Groq AI client for message generation

import Groq from 'groq-sdk';
import { MessageTone } from '@/types/database.types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const toneDescriptions: Record<MessageTone, string> = {
  motivational: 'encouraging and energetic',
  friendly: 'warm and casual',
  direct: 'brief and to-the-point',
  funny: 'humorous and playful'
};

/**
 * Generate an AI-powered reminder message
 * @param title - Reminder title (e.g., "Drink water")
 * @param tone - Message tone
 * @param hoursSinceLastReminder - Hours since last reminder (for context)
 * @returns Generated message text
 */
export async function generateReminderMessage(
  title: string,
  tone: MessageTone,
  hoursSinceLastReminder?: number
): Promise<string> {
  const contextPart = hoursSinceLastReminder
    ? `It's been ${hoursSinceLastReminder} hour${hoursSinceLastReminder !== 1 ? 's' : ''} since the last reminder.`
    : 'This is a reminder.';

  const prompt = `Generate a ${toneDescriptions[tone]} reminder message for "${title}".
Keep it under 15 words.
${contextPart}
Make it contextual and include a relevant emoji.
Return only the message text, no quotes or extra formatting.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      max_tokens: 50
    });

    const message = chatCompletion.choices[0]?.message?.content?.trim();

    if (!message) {
      throw new Error('No message generated');
    }

    return message;
  } catch (error: any) {
    console.error('Groq API error:', error.message);

    // Fallback to basic message if API fails
    const fallbackEmojis: Record<string, string> = {
      water: '💧',
      break: '☕',
      stretch: '🧘',
      posture: '👀',
      exercise: '💪',
      rest: '😴'
    };

    const emoji = Object.keys(fallbackEmojis).find(key =>
      title.toLowerCase().includes(key)
    ) ? fallbackEmojis[Object.keys(fallbackEmojis).find(key => title.toLowerCase().includes(key))!] : '🔔';

    return `${emoji} ${title}`;
  }
}
