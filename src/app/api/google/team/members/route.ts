import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// GET /api/google/team/members → users who have connected Google (super admin only)
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (caller.role !== "super_admin") return NextResponse.json({ error: "Super admin only." }, { status: 403 });

  const admin = getSupabaseAdmin();
  const { data: ga } = await admin.from("google_accounts").select("user_id, google_email");
  const ids = (ga ?? []).map((g) => g.user_id);
  if (!ids.length) return NextResponse.json({ members: [] });

  const { data: profs } = await admin.from("profiles").select("id, full_name, email, role").in("id", ids);
  const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
  const members = (ga ?? [])
    .map((g) => {
      const p = pmap.get(g.user_id);
      return {
        user_id: g.user_id,
        name: p?.full_name || p?.email || "Member",
        email: g.google_email || p?.email || null,
        role: p?.role ?? null,
      };
    })
    .filter((m) => m.email);

  return NextResponse.json({ members });
}
