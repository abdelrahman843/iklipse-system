import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getValidAccessToken, createEvent } from "@/lib/google";
import { getValidAccessToken as getZoomToken, createMeeting } from "@/lib/zoom";

// POST /api/google/team/schedule
// body: { userIds, startISO, endISO, title, description?, addZoom }
// Creates the event on the super admin's Google Calendar, attaches a Zoom
// meeting link (created on the super admin's Zoom account), and invites people.
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (caller.role !== "super_admin") return NextResponse.json({ error: "Super admin only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];
  const { startISO, endISO } = body;
  const title: string = (body.title || "Meeting").toString();
  // Accept legacy `addMeet` too, but Zoom is the video provider now.
  const addZoom: boolean = (body.addZoom ?? body.addMeet) !== false;
  if (!startISO || !endISO) return NextResponse.json({ error: "startISO/endISO required." }, { status: 400 });

  const token = await getValidAccessToken(caller.id);
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 409 });

  // Create the Zoom meeting first (if requested) so we can embed the join link
  // in the calendar event. Requires the organizer to have connected Zoom.
  let zoomUrl: string | undefined;
  if (addZoom) {
    const zoomToken = await getZoomToken(caller.id);
    if (!zoomToken) return NextResponse.json({ error: "zoom_not_connected" }, { status: 409 });
    const durationMin = Math.max(1, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000));
    try {
      const meeting = await createMeeting(zoomToken, { topic: title, startISO, durationMin, agenda: body.description || undefined });
      zoomUrl = meeting.join_url;
    } catch (e) {
      return NextResponse.json({ error: "zoom_create_failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 502 });
    }
  }

  // attendee emails (prefer google_email, fall back to profile email)
  const admin = getSupabaseAdmin();
  const [{ data: ga }, { data: profs }] = await Promise.all([
    admin.from("google_accounts").select("user_id, google_email").in("user_id", userIds),
    admin.from("profiles").select("id, email").in("id", userIds),
  ]);
  const gmap = new Map((ga ?? []).map((g) => [g.user_id, g.google_email]));
  const pmap = new Map((profs ?? []).map((p) => [p.id, p.email]));
  const emails = userIds.map((id) => gmap.get(id) || pmap.get(id)).filter((e): e is string => !!e);

  // Fold the Zoom link into the event body + location so invitees can join.
  const description = [body.description || "", zoomUrl ? `Join Zoom Meeting: ${zoomUrl}` : ""]
    .filter(Boolean)
    .join("\n\n") || undefined;

  try {
    const ev = await createEvent(token, {
      summary: title,
      description,
      location: zoomUrl,
      startISO,
      endISO,
      attendees: emails,
      addMeet: false, // no Google Meet — Zoom is the video provider
    });
    return NextResponse.json({ ok: true, link: ev.htmlLink, zoom: zoomUrl });
  } catch (e) {
    return NextResponse.json({ error: "create_failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 502 });
  }
}
