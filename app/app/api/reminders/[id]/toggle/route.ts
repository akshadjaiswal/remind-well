// API: POST /api/reminders/[id]/toggle - Toggle pause state

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current state
    const { data: current } = await supabase
      .from('rw_reminders')
      .select('is_paused')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Toggle pause state
    const { data: reminder, error } = await supabase
      .from('rw_reminders')
      .update({ is_paused: !current.is_paused })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error('POST /api/reminders/[id]/toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle reminder', message: error.message },
      { status: 500 }
    );
  }
}
