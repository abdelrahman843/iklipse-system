import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { getValidAccessToken, listEvents } from "@/lib/google";

// POST /api/google/team/events  body: { userIds, timeMin, timeMax }
// → each selected member's events in the window (super admin only).
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (caller.role !== "super_admin") return NextResponse.json({ error: "Super admin only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];
  const { timeMin, timeMax } = body;
  if (!timeMin || !timeMax) return NextResponse.json({ error: "timeMin/timeMax required." }, { status: 400 });

  const results = await Promise.all(
    userIds.map(async (uid) => {
      try {
        const token = await getValidAccessToken(uid);
        if (!token) return { user_id: uid, connected: false, events: [] };
        return { user_id: uid, connected: true, events: await listEvents(token, timeMin, timeMax) };
      } catch {
        return { user_id: uid, connected: false, events: [] };
      }
    }),
  );

  return NextResponse.json({ results });
}
