import { NextResponse, type NextRequest } from "next/server";
import { getCaller } from "@/lib/auth-server";
import { disconnect } from "@/lib/zoom";

// POST /api/zoom/disconnect → remove the caller's stored Zoom tokens.
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await disconnect(caller.id);
  return NextResponse.json({ ok: true });
}
