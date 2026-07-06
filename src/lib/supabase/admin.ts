import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ===========================================================================
   Server-only Supabase admin client (service_role).
   NEVER import this into a Client Component — the service_role key bypasses RLS
   and must stay on the server. Used by Route Handlers for privileged operations
   (creating / deleting auth users). The `server-only` import makes the build
   fail loudly if this file is ever pulled into client code.
   =========================================================================== */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
