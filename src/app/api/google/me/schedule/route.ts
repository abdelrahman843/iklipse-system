import { NextResponse, type NextRequest } from "next/server";
import { getCaller, isStaff } from "@/lib/auth-server";
import { getValidAccessToken, createEvent } from "@/lib/google";
import { getValidAccessToken as getZoomToken, createMeeting } from "@/lib/zoom";

// POST /api/google/me/schedule
// body: { participantEmails?: string[], startISO, endISO?, title, description?, addZoom?, open? }
// Any staff member schedules on THEIR OWN Google Calendar. Participants are
// arbitrary emails (internal or external). Optionally attaches a Zoom link.
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isStaff(caller.role)) return NextResponse.json({ error: "Not available for your role." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const title: string = (body.title || "Meeting").toString();
  const open: boolean = body.open === true;
  const startISO: string | undefined = body.startISO;
  if (!startISO) return NextResponse.json({ error: "startISO required." }, { status: 400 });

  // "Open" → 1-hour calendar block (the Zoom call itself stays open until the
  // free-plan 40-min cap or the host leaves). Otherwise use the given end.
  const endISO: string = open
    ? new Date(new Date(startISO).getTime() + 60 * 60_000).toISOString()
    : body.endISO;
  if (!endISO) return NextResponse.json({ error: "endISO required (or set open)." }, { status: 400 });

  const emails: string[] = Array.isArray(body.participantEmails)
    ? body.participantEmails.map((e: unknown) => String(e).trim()).filter((e: string) => /.+@.+\..+/.test(e))
    : [];

  const token = await getValidAccessToken(caller.id);
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 409 });

  let zoomUrl: string | undefined;
  if (body.addZoom) {
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
      addMeet: false,
    });
    return NextResponse.json({ ok: true, link: ev.htmlLink, zoom: zoomUrl });
  } catch (e) {
    return NextResponse.json({ error: "create_failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 502 });
  }
}
