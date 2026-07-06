import "server-only";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/* Shared helper for Route Handlers: resolve the caller from their Bearer token
   and load their profile role. Returns null if unauthenticated. */

export type Caller = { id: string; email: string; role: string; isActive: boolean };

export const STAFF_ROLES = ["super_admin", "admin", "manager", "member"];
export const isStaff = (role: string) => STAFF_ROLES.includes(role);

export async function getCaller(request: NextRequest): Promise<Caller | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active, email")
    .eq("id", data.user.id)
    .single();
  if (!profile) return null;

  return {
    id: data.user.id,
    email: profile.email ?? data.user.email ?? "",
    role: profile.role,
    isActive: profile.is_active,
  };
}
