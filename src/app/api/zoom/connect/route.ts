import { NextResponse, type NextRequest } from "next/server";
import { getCaller, isStaff } from "@/lib/auth-server";
import { buildAuthUrl, zoomConfig, signState } from "@/lib/zoom";

// GET /api/zoom/connect → returns the Zoom OAuth consent URL for the caller.
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isStaff(caller.role)) return NextResponse.json({ error: "Not available for your role." }, { status: 403 });

  if (!zoomConfig().configured) {
    return NextResponse.json({ error: "Zoom is not configured on the server yet." }, { status: 503 });
  }

  return NextResponse.json({ url: buildAuthUrl(signState(caller.id)) });
}
