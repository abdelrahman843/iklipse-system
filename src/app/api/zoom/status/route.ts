import { NextResponse, type NextRequest } from "next/server";
import { getCaller, isStaff } from "@/lib/auth-server";
import { getConnection, zoomConfig } from "@/lib/zoom";

// GET /api/zoom/status → { configured, allowed, connected, email } for the caller.
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const configured = zoomConfig().configured;
  const allowed = isStaff(caller.role);
  const conn = configured && allowed ? await getConnection(caller.id) : { connected: false, email: null };

  return NextResponse.json({ configured, allowed, connected: conn.connected, email: conn.email });
}
