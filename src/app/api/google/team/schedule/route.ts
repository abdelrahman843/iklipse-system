import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getValidAccessToken, createEvent } from "@/lib/google";

// POST /api/google/team/schedule
// body: { userIds, startISO, endISO, title, description?, addMeet }
// Creates the event on the super admin's calendar and invites the selected people.
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (caller.role !== "super_admin") return NextResponse.json({ error: "Super admin only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];
  const { startISO, endISO } = body;
  const title: string = (body.title || "Meeting").toString();
  const addMeet: boolean = body.addMeet !== false;
  if (!startISO || !endISO) return NextResponse.json({ error: "startISO/endISO required." }, { status: 400 });

  const token = await getValidAccessToken(caller.id);
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 409 });

  // attendee emails (prefer google_email, fall back to profile email)
  const admin = getSupabaseAdmin();
  const [{ data: ga }, { data: profs }] = await Promise.all([
    admin.from("google_accounts").select("user_id, google_email").in("user_id", userIds),
    admin.from("profiles").select("id, email").in("id", userIds),
  ]);
  const gmap = new Map((ga ?? []).map((g) => [g.user_id, g.google_email]));
  const pmap = new Map((profs ?? []).map((p) => [p.id, p.email]));
  const emails = userIds.map((id) => gmap.get(id) || pmap.get(id)).filter((e): e is string => !!e);

  try {
    const ev = await createEvent(token, {
      summary: title,
      description: body.description || undefined,
      startISO,
      endISO,
      attendees: emails,
      addMeet,
    });
    return NextResponse.json({ ok: true, link: ev.htmlLink, meet: ev.hangoutLink });
  } catch (e) {
    return NextResponse.json({ error: "create_failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 502 });
  }
}
