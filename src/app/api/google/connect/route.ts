import { NextResponse, type NextRequest } from "next/server";
import { getCaller, isStaff } from "@/lib/auth-server";
import { buildAuthUrl, googleConfig, signState } from "@/lib/google";

// GET /api/google/connect → returns the Google OAuth consent URL for the caller.
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isStaff(caller.role)) return NextResponse.json({ error: "Not available for your role." }, { status: 403 });

  if (!googleConfig().configured) {
    return NextResponse.json({ error: "Google Calendar is not configured on the server yet." }, { status: 503 });
  }

  return NextResponse.json({ url: buildAuthUrl(signState(caller.id)) });
}
