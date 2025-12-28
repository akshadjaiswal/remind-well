// OAuth callback handler

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Check onboarding status to determine redirect
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('rw_users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      // Redirect based on onboarding status
      const redirectTo = profile?.onboarding_completed
        ? '/dashboard'
        : '/dashboard/onboarding';

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // Fallback: redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
