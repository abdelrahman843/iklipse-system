"use client";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/* fetch() wrapper that attaches the current Supabase access token as a Bearer
   header, so our Route Handlers can authenticate the caller. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (isSupabaseConfigured) {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
