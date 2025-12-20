// External service types (Telegram, Resend, Groq)

// ========================================
// Telegram API Types
// ========================================

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  date: number;
}

export interface TelegramSendMessageRequest {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export interface TelegramSendMessageResponse {
  ok: boolean;
  result: {
    message_id: number;
    date: number;
    text: string;
  };
}

// ========================================
// Resend API Types
// ========================================

export interface ResendSendEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export interface ResendSendEmailResponse {
  id: string;
}

// ========================================
// Groq API Types
// ========================================

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatRequest {
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface GroqChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
