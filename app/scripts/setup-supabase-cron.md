# Supabase pg_cron Setup Guide

This guide will help you set up automated cron jobs using Supabase's built-in pg_cron extension.

## Step 1: Enable Extensions and Run Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your RemindWell project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase/migrations/005_setup_cron.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see success messages in the Results panel.

## Step 2: Configure Secrets

### Option A: Using Supabase Vault (Recommended)

1. In Supabase dashboard, go to **Project Settings** (gear icon) → **Vault**
2. Click **New Secret**
3. Add two secrets:

**Secret 1:**
- Name: `APP_URL`
- Secret: `https://your-app.vercel.app` (your production Vercel URL)

**Secret 2:**
- Name: `CRON_SECRET`
- Secret: Your cron secret (same as in Vercel env vars)

### Option B: Using Database Configuration

If Vault doesn't work, run these SQL commands in SQL Editor:

```sql
-- Set APP_URL
ALTER DATABASE postgres SET app.url = 'https://your-app.vercel.app';

-- Set CRON_SECRET
ALTER DATABASE postgres SET app.cron_secret = 'your-cron-secret-here';

-- Reload configuration
SELECT pg_reload_conf();
```

**Important**: Replace `your-app.vercel.app` and `your-cron-secret-here` with your actual values!

## Step 3: Verify Cron Job is Scheduled

Run this query in SQL Editor:

```sql
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job;
```

You should see:
- `jobname`: check-reminders-every-minute
- `schedule`: * * * * *
- `active`: true

## Step 4: Test Execution

Wait 1-2 minutes, then check execution history:

```sql
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

Look for:
- `status`: succeeded
- `return_message`: Should show "Cron executed successfully"

## Step 5: Monitor in Real-Time

### View Recent Executions:
```sql
SELECT
  start_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
ORDER BY start_time DESC
LIMIT 20;
```

### Check Success Rate:
```sql
SELECT
  status,
  COUNT(*) as count
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-reminders-every-minute')
GROUP BY status;
```

## Troubleshooting

### Issue: Cron job not running

**Check if extensions are enabled:**
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
```

Both should show `installed_version` with a value.

### Issue: "APP_URL or CRON_SECRET not configured"

**Solution**: Make sure you completed Step 2 (Configure Secrets)

**Verify secrets are set:**
```sql
-- Check Vault secrets
SELECT name FROM vault.decrypted_secrets WHERE name IN ('APP_URL', 'CRON_SECRET');

-- Or check database settings
SHOW app.url;
SHOW app.cron_secret;
```

### Issue: HTTP request fails (401 Unauthorized)

**Solution**: CRON_SECRET mismatch

1. Get CRON_SECRET from Vercel:
   - Go to Vercel dashboard → Your Project → Settings → Environment Variables
   - Copy the exact value of `CRON_SECRET`

2. Update in Supabase to match exactly:
   ```sql
   ALTER DATABASE postgres SET app.cron_secret = 'exact-value-from-vercel';
   SELECT pg_reload_conf();
   ```

### Issue: HTTP request fails (500 Internal Server Error)

**Solution**: Check Vercel function logs

1. Go to Vercel dashboard → Deployments → Latest deployment → Functions
2. Click on `/api/cron/check-reminders`
3. View error logs

### Issue: Need to update APP_URL (e.g., after redeployment)

```sql
-- Update APP_URL
ALTER DATABASE postgres SET app.url = 'https://new-url.vercel.app';

-- Reload
SELECT pg_reload_conf();

-- Test immediately
SELECT check_reminders_cron();
```

## Unschedule/Disable Cron (if needed)

```sql
-- Unschedule the job
SELECT cron.unschedule('check-reminders-every-minute');

-- Or just disable it temporarily
UPDATE cron.job
SET active = false
WHERE jobname = 'check-reminders-every-minute';

-- Re-enable
UPDATE cron.job
SET active = true
WHERE jobname = 'check-reminders-every-minute';
```

## Manual Test

To manually trigger the cron function (useful for testing):

```sql
SELECT check_reminders_cron();
```

This will execute immediately and show you any errors.

## Success Criteria

✅ Cron job appears in `cron.job` table
✅ Executions appear every minute in `cron.job_run_details`
✅ Status shows "succeeded"
✅ Your Vercel API logs show successful cron requests
✅ Reminders are being sent as expected

## Performance Notes

- **Execution Time**: Typically 100-500ms per execution
- **Database Load**: Minimal (single SELECT query + HTTP call)
- **Cost**: Completely free on Supabase free tier
- **Reliability**: Very high (runs directly in database)

## Next Steps

Once cron is working:
1. Delete/disable EasyCron account (no longer needed)
2. Monitor for 24 hours to ensure stability
3. Update CLAUDE.md documentation with final setup

## Getting Help

If you encounter issues:
1. Check `cron.job_run_details` for error messages
2. Run `SELECT check_reminders_cron();` manually to test
3. Verify Vercel function logs show incoming requests
4. Ensure CRON_SECRET matches exactly between Supabase and Vercel
