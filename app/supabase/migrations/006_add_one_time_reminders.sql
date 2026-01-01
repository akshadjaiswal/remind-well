-- =====================================================
-- Migration 006: Add One-Time Reminders Support
-- =====================================================
-- This migration adds support for one-time reminders that fire
-- once at a specific date/time, then auto-archive.
--
-- Changes:
-- 1. Add reminder_type column ('recurring' | 'one_time')
-- 2. Add scheduled_for column (exact datetime for one-time reminders)
-- 3. Add archived_at column (soft-delete timestamp)
-- 4. Make interval_minutes nullable (not needed for one-time)
-- 5. Add constraints to enforce data integrity
-- 6. Update indexes to exclude archived reminders
-- =====================================================

-- Add new columns
ALTER TABLE rw_reminders
  ADD COLUMN reminder_type VARCHAR(20) DEFAULT 'recurring'
    CHECK (reminder_type IN ('recurring', 'one_time')),
  ADD COLUMN scheduled_for TIMESTAMPTZ NULL,
  ADD COLUMN archived_at TIMESTAMPTZ NULL;

-- Make interval_minutes nullable for one-time reminders
ALTER TABLE rw_reminders
  ALTER COLUMN interval_minutes DROP NOT NULL;

-- Add constraint: recurring reminders must have interval_minutes
ALTER TABLE rw_reminders
  ADD CONSTRAINT check_recurring_has_interval
    CHECK (
      (reminder_type = 'recurring' AND interval_minutes IS NOT NULL) OR
      (reminder_type = 'one_time')
    );

-- Add constraint: one-time reminders must have scheduled_for
ALTER TABLE rw_reminders
  ADD CONSTRAINT check_one_time_has_scheduled_for
    CHECK (
      (reminder_type = 'one_time' AND scheduled_for IS NOT NULL) OR
      (reminder_type = 'recurring')
    );

-- Create index for archived reminders (for history/analytics)
CREATE INDEX idx_reminders_archived ON rw_reminders(archived_at)
  WHERE archived_at IS NOT NULL;

-- Update the next_scheduled index to exclude archived reminders
-- This improves cron job performance by only scanning active reminders
DROP INDEX IF EXISTS idx_reminders_next_scheduled;
CREATE INDEX idx_reminders_next_scheduled ON rw_reminders(next_scheduled_at)
  WHERE is_active = true AND is_paused = false AND archived_at IS NULL;

-- Backfill existing reminders to have reminder_type = 'recurring'
-- This ensures backward compatibility with existing data
UPDATE rw_reminders
SET reminder_type = 'recurring'
WHERE reminder_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN rw_reminders.reminder_type IS 'Type of reminder: recurring (repeats on interval) or one_time (fires once then archives)';
COMMENT ON COLUMN rw_reminders.scheduled_for IS 'For one-time reminders: the exact datetime to send notification (stored in UTC)';
COMMENT ON COLUMN rw_reminders.archived_at IS 'Timestamp when reminder was archived (for one-time reminders after sending, or manually archived recurring reminders)';

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 006 complete!';
  RAISE NOTICE 'Added one-time reminder support:';
  RAISE NOTICE '  - reminder_type column (recurring/one_time)';
  RAISE NOTICE '  - scheduled_for column (exact datetime for one-time)';
  RAISE NOTICE '  - archived_at column (soft-delete)';
  RAISE NOTICE '  - Updated indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'Existing reminders remain unchanged (set to "recurring" type).';
END $$;
