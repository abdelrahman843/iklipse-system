import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { getValidAccessToken, freeBusy, type BusyInterval } from "@/lib/google";

// POST /api/google/team/freebusy
// body: { userIds: string[], timeMin, timeMax, durationMin, stepMin? }
// → common free slots where ALL selected people (+ the super admin) are free.
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (caller.role !== "super_admin") return NextResponse.json({ error: "Super admin only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : [];
  const timeMin: string = body.timeMin;
  const timeMax: string = body.timeMax;
  const durationMin: number = Number(body.durationMin) || 30;
  const stepMin: number = Number(body.stepMin) || 30;
  if (!timeMin || !timeMax) return NextResponse.json({ error: "timeMin/timeMax required." }, { status: 400 });

  // include the organizer's own calendar
  const targets = Array.from(new Set([caller.id, ...userIds]));
  const busy: BusyInterval[] = [];
  const notConnected: string[] = [];

  await Promise.all(
    targets.map(async (uid) => {
      try {
        const token = await getValidAccessToken(uid);
        if (!token) { notConnected.push(uid); return; }
        busy.push(...(await freeBusy(token, timeMin, timeMax)));
      } catch {
        notConnected.push(uid);
      }
    }),
  );

  // merge busy intervals
  const merged = mergeIntervals(busy.map((b) => [new Date(b.start).getTime(), new Date(b.end).getTime()]));

  const winStart = new Date(timeMin).getTime();
  const winEnd = new Date(timeMax).getTime();
  const durMs = durationMin * 60_000;
  const stepMs = stepMin * 60_000;

  const slots: { start: string; end: string }[] = [];
  for (let s = winStart; s + durMs <= winEnd; s += stepMs) {
    const e = s + durMs;
    const clash = merged.some(([bs, be]) => bs < e && s < be);
    if (!clash) slots.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString() });
  }

  return NextResponse.json({ slots, notConnected });
}

function mergeIntervals(iv: [number, number][]): [number, number][] {
  if (!iv.length) return [];
  iv.sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [iv[0]];
  for (let i = 1; i < iv.length; i++) {
    const last = out[out.length - 1];
    if (iv[i][0] <= last[1]) last[1] = Math.max(last[1], iv[i][1]);
    else out.push(iv[i]);
  }
  return out;
}
