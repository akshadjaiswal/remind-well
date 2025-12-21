/**
 * Test cron job locally
 * Run with: npm run test:cron
 *
 * Prerequisites:
 * 1. Dev server must be running (npm run dev)
 * 2. CRON_SECRET must be set in .env.local
 * 3. At least one reminder with next_scheduled_at in the past
 *
 * To create a test reminder:
 * - Create a reminder via the UI
 * - Then manually update it in Supabase:
 *   UPDATE rw_reminders
 *   SET next_scheduled_at = NOW() - INTERVAL '5 minutes'
 *   WHERE id = '<your-reminder-id>';
 */

import 'dotenv/config';

async function testCron() {
  console.log('🚀 Testing cron job...\n');

  // Validate environment
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRON_SECRET not found in environment');
    console.log('\n💡 Add this to your .env.local:');
    console.log('   CRON_SECRET=local-dev-secret-123\n');
    process.exit(1);
  }

  try {
    const response = await fetch('http://localhost:3000/api/cron/check-reminders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Cron job successful!');
      console.log(`   Processed: ${data.processed} reminders`);
      console.log(`   Failed: ${data.failed || 0}`);
      console.log(`   Total: ${data.total || 0}`);
      console.log(`   Timestamp: ${data.timestamp}`);

      if (data.total === 0) {
        console.log('\n💡 No reminders were due for processing.');
        console.log('   To test the cron job:');
        console.log('   1. Create a reminder via the UI');
        console.log('   2. Update it in Supabase to be in the past:');
        console.log('      UPDATE rw_reminders');
        console.log('      SET next_scheduled_at = NOW() - INTERVAL \'5 minutes\'');
        console.log('      WHERE id = \'<your-reminder-id>\';');
        console.log('   3. Run this script again\n');
      }
    } else {
      console.error('❌ Cron job failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || 'Unknown error'}`);
      console.error(`   Message: ${data.message || 'No message provided'}`);

      if (response.status === 401) {
        console.log('\n💡 Authorization failed. Check that CRON_SECRET in .env.local matches the server.\n');
      }
    }
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Is your dev server running? (npm run dev)');
    console.log('   2. Is it running on http://localhost:3000?');
    console.log('   3. Check the terminal where "npm run dev" is running for errors\n');
  }
}

testCron();
