// API: GET /api/user - Get current user
// API: PATCH /api/user - Update user profile

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { updateUserSchema } from '@/lib/validations';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('rw_users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    // Add computed property
    const userWithComputed = {
      ...user,
      hasTelegram: !!user.telegram_chat_id
    };

    return NextResponse.json({ user: userWithComputed });
  } catch (error: any) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const { data: user, error } = await supabase
      .from('rw_users')
      .update(validated)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('PATCH /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', message: error.message },
      { status: 500 }
    );
  }
}
