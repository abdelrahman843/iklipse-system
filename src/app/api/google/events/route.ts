import { NextResponse, type NextRequest } from "next/server";
import { getCaller, isStaff } from "@/lib/auth-server";
import { getValidAccessToken, listEvents } from "@/lib/google";

const DAY = 86_400_000;

// GET /api/google/events?timeMin=&timeMax= → events from the caller's primary calendar.
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isStaff(caller.role)) return NextResponse.json({ error: "Not available for your role." }, { status: 403 });

  const url = new URL(request.url);
  const timeMin = url.searchParams.get("timeMin") ?? new Date(Date.now() - 7 * DAY).toISOString();
  const timeMax = url.searchParams.get("timeMax") ?? new Date(Date.now() + 60 * DAY).toISOString();

  try {
    const token = await getValidAccessToken(caller.id);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 409 });
    const events = await listEvents(token, timeMin, timeMax);
    return NextResponse.json({ events });
  } catch (e) {
    return NextResponse.json(
      { error: "fetch_failed", detail: e instanceof Error ? e.message : "Unknown error" },
      { status: 502 },
    );
  }
}
