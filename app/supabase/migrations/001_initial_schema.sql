-- RemindWell Database Schema
-- Migration 001: Initial schema with all tables and indexes

-- Table 1: User Profiles
CREATE TABLE rw_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  email VARCHAR(255) NOT NULL,
  telegram_chat_id VARCHAR(100),
  telegram_username VARCHAR(100),

  default_tone VARCHAR(20) DEFAULT 'friendly'
    CHECK (default_tone IN ('motivational', 'friendly', 'direct', 'funny')),
  timezone VARCHAR(50) DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT false,

  CONSTRAINT unique_telegram_chat_id UNIQUE (telegram_chat_id)
);

-- Indexes for rw_users
CREATE INDEX idx_users_telegram ON rw_users(telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX idx_users_email ON rw_users(email);

-- Table 2: Reminders
CREATE TABLE rw_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  user_id UUID REFERENCES rw_users(id) ON DELETE CASCADE NOT NULL,

  title VARCHAR(200) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🔔',

  interval_minutes INTEGER NOT NULL
    CHECK (interval_minutes >= 15 AND interval_minutes <= 1440),

  notification_method VARCHAR(20) NOT NULL
    CHECK (notification_method IN ('telegram', 'email', 'both')),
  message_tone VARCHAR(20) DEFAULT 'friendly'
    CHECK (message_tone IN ('motivational', 'friendly', 'direct', 'funny')),

  active_hours_start TIME,
  active_hours_end TIME,
  skip_weekends BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,

  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,

  CONSTRAINT valid_active_hours CHECK (
    (active_hours_start IS NULL AND active_hours_end IS NULL) OR
    (active_hours_start IS NOT NULL AND active_hours_end IS NOT NULL)
  )
);

-- Indexes for rw_reminders
CREATE INDEX idx_reminders_user ON rw_reminders(user_id);
CREATE INDEX idx_reminders_next_scheduled ON rw_reminders(next_scheduled_at)
  WHERE is_active = true AND is_paused = false;
CREATE INDEX idx_reminders_active ON rw_reminders(is_active, is_paused);

-- Table 3: Notification Logs
CREATE TABLE rw_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  reminder_id UUID REFERENCES rw_reminders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES rw_users(id) ON DELETE CASCADE NOT NULL,

  message TEXT NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('telegram', 'email')),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),

  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  external_id VARCHAR(255)
);

-- Indexes for rw_notifications
CREATE INDEX idx_notifications_reminder ON rw_notifications(reminder_id);
CREATE INDEX idx_notifications_user ON rw_notifications(user_id);
CREATE INDEX idx_notifications_status ON rw_notifications(status, created_at DESC);
CREATE INDEX idx_notifications_created ON rw_notifications(created_at DESC);

-- Table 4: Daily Statistics
CREATE TABLE rw_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES rw_users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  reminders_sent INTEGER DEFAULT 0,

  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Indexes for rw_stats
CREATE INDEX idx_stats_user_date ON rw_stats(user_id, date DESC);
