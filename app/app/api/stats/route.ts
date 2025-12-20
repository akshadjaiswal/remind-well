// API: GET /api/stats - Get dashboard stats

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reminder counts
    const { data: reminders } = await supabase
      .from('rw_reminders')
      .select('is_paused')
      .eq('user_id', user.id);

    const activeReminders = reminders?.filter(r => !r.is_paused).length || 0;
    const pausedReminders = reminders?.filter(r => r.is_paused).length || 0;
    const totalReminders = reminders?.length || 0;

    // Get today's sent count
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('rw_stats')
      .select('reminders_sent')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const stats = {
      activeReminders,
      pausedReminders,
      todaysSent: todayStats?.reminders_sent || 0,
      totalReminders
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}
