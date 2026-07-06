import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, storeTokens, verifyState, getZoomUser } from "@/lib/zoom";

// GET /api/zoom/callback — Zoom redirects here after consent. No Bearer header
// (it's a browser navigation from Zoom), so we trust the signed state.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const base = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return NextResponse.redirect(`${base}/calendar?zoom=denied`);
  if (!code || !state) return NextResponse.redirect(`${base}/calendar?zoom=error`);

  const userId = verifyState(state);
  if (!userId) return NextResponse.redirect(`${base}/calendar?zoom=error`);

  try {
    const tok = await exchangeCode(code);
    // Best-effort identity so we can show which Zoom account is linked.
    const identity = await getZoomUser(tok.access_token).catch(() => undefined);
    await storeTokens(userId, tok, identity);
    return NextResponse.redirect(`${base}/calendar?zoom=connected`);
  } catch {
    return NextResponse.redirect(`${base}/calendar?zoom=error`);
  }
}
