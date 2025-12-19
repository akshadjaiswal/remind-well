// Server-side auth helpers

import { createClient } from '@/lib/supabase/server';

/**
 * Get the currently authenticated user on the server
 * @returns User object or null
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication - throws error if not authenticated
 * Use in API routes
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
