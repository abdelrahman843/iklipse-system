"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ===========================================================================
   Browser Supabase client (Bearer / SPA model).
   The client stores the session in localStorage and automatically attaches the
   access token as `Authorization: Bearer <jwt>` on every request to PostgREST,
   where RLS enforces access. No cookies / SSR involved.

   Env is read lazily so the app still boots before Supabase is configured —
   in that state `isSupabaseConfigured` is false and auth surfaces a friendly
   "not configured" message instead of crashing at import.
   =========================================================================== */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
