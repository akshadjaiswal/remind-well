-- =====================================================
-- Supabase pg_cron Quick Setup
-- =====================================================
-- Copy and run these commands in Supabase SQL Editor
-- =====================================================

-- STEP 1: Run the migration (copy from 005_setup_cron.sql)
-- Then continue with steps below...

-- STEP 2: Set your production URL and cron secret
-- IMPORTANT: Replace these values with your actual ones!
ALTER DATABASE postgres SET app.url = 'https://your-app.vercel.app';
ALTER DATABASE postgres SET app.cron_secret = 'your-cron-secret-here';

-- Reload configuration
SELECT pg_reload_conf();

-- STEP 3: Verify cron job is scheduled
SELECT
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'check-reminders-every-minute';

-- Expected output:
-- jobname: check-reminders-every-minute
-- schedule: * * * * *
-- active: true

-- STEP 4: Test immediately (don't wait for next minute)
SELECT check_reminders_cron();

-- STEP 5: Check execution history (wait 1-2 minutes first)
SELECT
  start_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
ORDER BY start_time DESC
LIMIT 10;

-- =====================================================
-- Useful Monitoring Queries
-- =====================================================

-- View recent executions
SELECT
  start_time,
  status,
  SUBSTRING(return_message, 1, 100) as message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
ORDER BY start_time DESC
LIMIT 20;

-- Success rate (last 100 runs)
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
GROUP BY status;

-- Check if running right now
SELECT
  job_pid,
  start_time,
  status
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
  AND status = 'running'
ORDER BY start_time DESC;

-- =====================================================
-- Troubleshooting Queries
-- =====================================================

-- Check if extensions are enabled
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pg_cron', 'http');

-- View current configuration
SELECT name, setting
FROM pg_settings
WHERE name LIKE 'app.%';

-- View errors from last hour
SELECT
  start_time,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
  AND status != 'succeeded'
  AND start_time > NOW() - INTERVAL '1 hour'
ORDER BY start_time DESC;

-- =====================================================
-- Management Commands
-- =====================================================

-- Temporarily disable cron
UPDATE cron.job
SET active = false
WHERE jobname = 'check-reminders-every-minute';

-- Re-enable cron
UPDATE cron.job
SET active = true
WHERE jobname = 'check-reminders-every-minute';

-- Completely remove cron job
SELECT cron.unschedule('check-reminders-every-minute');

-- Update configuration (if URL changes)
ALTER DATABASE postgres SET app.url = 'https://new-url.vercel.app';
SELECT pg_reload_conf();
