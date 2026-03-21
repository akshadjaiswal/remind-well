-- Migration: Remove Email Notification Method
-- Date: 2026-02-08
-- Description: Converts all reminders to Telegram-only delivery
-- This migration is safe to run and preserves all historical data

-- ============================================================
-- STEP 1: Check existing notification data
-- ============================================================

-- First, let's see what we have in notifications table
DO $$
DECLARE
    email_count INTEGER;
    telegram_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO email_count FROM rw_notifications WHERE method = 'email';
    SELECT COUNT(*) INTO telegram_count FROM rw_notifications WHERE method = 'telegram';

    RAISE NOTICE 'Found % email notifications and % telegram notifications', email_count, telegram_count;
END $$;

-- ============================================================
-- STEP 2: Update existing reminders to use Telegram
-- ============================================================

-- Convert all 'email' and 'both' reminders to 'telegram'
UPDATE rw_reminders
SET notification_method = 'telegram'
WHERE notification_method IN ('email', 'both');

-- ============================================================
-- STEP 3: Update rw_reminders table constraints
-- ============================================================

-- Drop old constraint that allowed 'email' and 'both'
ALTER TABLE rw_reminders
DROP CONSTRAINT IF EXISTS rw_reminders_notification_method_check;

-- Add new constraint: only 'telegram' allowed
ALTER TABLE rw_reminders
ADD CONSTRAINT rw_reminders_notification_method_check
CHECK (notification_method = 'telegram');

-- Add column comment explaining the change
COMMENT ON COLUMN rw_reminders.notification_method IS
'Notification delivery method. Email deprecated Feb 2026 - Telegram only.';

-- ============================================================
-- STEP 4: Handle historical notifications
-- ============================================================

-- We do NOT add a constraint to rw_notifications because we want to preserve
-- historical email notification records for audit/analytics purposes.
-- The application code now only creates 'telegram' notifications going forward.

-- Just add a comment documenting the change
COMMENT ON COLUMN rw_notifications.method IS
'Notification method. Historical email logs preserved (read-only). New records are Telegram only (since Feb 2026).';

-- ============================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================

-- Check all active reminders now use telegram (should return 0 rows)
-- SELECT id, title, notification_method FROM rw_reminders WHERE notification_method != 'telegram';

-- Count reminders by method (should only show 'telegram')
-- SELECT notification_method, COUNT(*) FROM rw_reminders GROUP BY notification_method;

-- See historical notifications breakdown
-- SELECT method, COUNT(*) FROM rw_notifications GROUP BY method;

-- Verify constraint is in place for reminders
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name = 'rw_reminders_notification_method_check';
