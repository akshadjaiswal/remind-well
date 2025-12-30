-- =====================================================
-- Migration 005: Setup pg_cron for automated reminders
-- =====================================================
-- This migration sets up automated cron job that runs every minute
-- to check and send due reminders via our API endpoint.
--
-- Prerequisites:
-- 1. NEXT_PUBLIC_APP_URL must be set in Supabase Vault or as a secret
-- 2. CRON_SECRET must be set in Supabase Vault
--
-- Monitoring:
-- - View scheduled jobs: SELECT * FROM cron.job;
-- - View execution history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Grant permissions to use pg_cron
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create function to call our API endpoint
CREATE OR REPLACE FUNCTION check_reminders_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_url text;
  cron_secret text;
  response http_response;
BEGIN
  -- Get environment variables from Supabase Vault
  -- Note: You'll need to set these in Supabase dashboard under Project Settings > Vault
  SELECT decrypted_secret INTO app_url
  FROM vault.decrypted_secrets
  WHERE name = 'APP_URL';

  SELECT decrypted_secret INTO cron_secret
  FROM vault.decrypted_secrets
  WHERE name = 'CRON_SECRET';

  -- If secrets not in vault, try to get from environment
  IF app_url IS NULL THEN
    app_url := current_setting('app.url', true);
  END IF;

  IF cron_secret IS NULL THEN
    cron_secret := current_setting('app.cron_secret', true);
  END IF;

  -- Fallback to empty if still not found (for initial setup)
  IF app_url IS NULL OR cron_secret IS NULL THEN
    RAISE NOTICE 'APP_URL or CRON_SECRET not configured. Please set in Supabase Vault or via ALTER DATABASE.';
    RETURN;
  END IF;

  -- Make HTTP POST request to our API endpoint
  SELECT * INTO response
  FROM http((
    'POST',
    app_url || '/api/cron/check-reminders',
    ARRAY[
      http_header('Authorization', 'Bearer ' || cron_secret),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    ''
  )::http_request);

  -- Log the response for debugging
  IF response.status >= 200 AND response.status < 300 THEN
    RAISE NOTICE 'Cron executed successfully: status=%, response=%', response.status, response.content;
  ELSE
    RAISE WARNING 'Cron execution failed: status=%, response=%', response.status, response.content;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Cron execution error: %', SQLERRM;
END;
$$;

-- Schedule the cron job to run every minute
-- This will check for due reminders and send notifications
SELECT cron.schedule(
  'check-reminders-every-minute',  -- job name
  '* * * * *',                      -- every minute (cron expression)
  $$SELECT check_reminders_cron()$$
);

-- Add comment for documentation
COMMENT ON FUNCTION check_reminders_cron() IS
'Automated function that calls the RemindWell API cron endpoint every minute to check and send due reminders. Requires APP_URL and CRON_SECRET to be set in Supabase Vault.';

-- Log successful setup
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job setup complete!';
  RAISE NOTICE 'Job name: check-reminders-every-minute';
  RAISE NOTICE 'Schedule: Every minute (* * * * *)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Configure these secrets in Supabase dashboard:';
  RAISE NOTICE '1. Go to Project Settings > Vault';
  RAISE NOTICE '2. Add secret: APP_URL = https://your-app.vercel.app';
  RAISE NOTICE '3. Add secret: CRON_SECRET = your-cron-secret';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify cron job:';
  RAISE NOTICE 'SELECT * FROM cron.job;';
  RAISE NOTICE '';
  RAISE NOTICE 'To view execution history:';
  RAISE NOTICE 'SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;';
END $$;
