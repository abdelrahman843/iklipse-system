import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, storeTokens, verifyState } from "@/lib/google";

// GET /api/google/callback — Google redirects here after consent. No Bearer
// header (it's a browser navigation from Google), so we trust the signed state.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const base = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return NextResponse.redirect(`${base}/calendar?google=denied`);
  if (!code || !state) return NextResponse.redirect(`${base}/calendar?google=error`);

  const userId = verifyState(state);
  if (!userId) return NextResponse.redirect(`${base}/calendar?google=error`);

  try {
    const tok = await exchangeCode(code);
    await storeTokens(userId, tok);
    return NextResponse.redirect(`${base}/calendar?google=connected`);
  } catch {
    return NextResponse.redirect(`${base}/calendar?google=error`);
  }
}
