-- RemindWell Row Level Security Policies
-- Migration 002: RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE rw_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rw_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rw_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rw_stats ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies for rw_users
-- ========================================

CREATE POLICY "Users can view own profile"
  ON rw_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON rw_users FOR UPDATE
  USING (auth.uid() = id);

-- ========================================
-- RLS Policies for rw_reminders
-- ========================================

CREATE POLICY "Users can view own reminders"
  ON rw_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON rw_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON rw_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON rw_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- RLS Policies for rw_notifications
-- ========================================

CREATE POLICY "Users can view own notifications"
  ON rw_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ========================================
-- RLS Policies for rw_stats
-- ========================================

CREATE POLICY "Users can view own stats"
  ON rw_stats FOR SELECT
  USING (auth.uid() = user_id);
