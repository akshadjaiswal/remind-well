-- RemindWell Database Functions and Triggers
-- Migration 003: Utility functions for automation

-- ========================================
-- Function: Auto-create user profile on signup
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.rw_users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- Function: Increment daily stats (upsert)
-- ========================================

CREATE OR REPLACE FUNCTION public.increment_daily_stats(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.rw_stats (user_id, date, reminders_sent)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET reminders_sent = rw_stats.reminders_sent + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Function: Update updated_at timestamp
-- ========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for rw_users
CREATE TRIGGER update_rw_users_updated_at
  BEFORE UPDATE ON rw_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for rw_reminders
CREATE TRIGGER update_rw_reminders_updated_at
  BEFORE UPDATE ON rw_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
