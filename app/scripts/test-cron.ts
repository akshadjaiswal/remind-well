/**
 * Test cron job locally
 * Run with: npm run test:cron
 */

import 'dotenv/config';

async function testCron() {
  console.log('🚀 Testing cron job...\n');

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
    } else {
      console.error('❌ Cron job failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);
      console.error(`   Message: ${data.message}`);
    }
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Is your dev server running? (npm run dev)');
  }
}

testCron();
