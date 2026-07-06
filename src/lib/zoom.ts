import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
// State signing/verification is provider-agnostic (just an HMAC over the user
// id) — reuse the Google helpers instead of duplicating the crypto.
import { signState, verifyState } from "@/lib/google";

/* ===========================================================================
   Zoom OAuth + Meetings helpers (server-only, dependency-light).
   Uses raw fetch against Zoom's OAuth + REST API — no SDK. Tokens live in
   public.zoom_accounts (RLS-locked). Each user connects their OWN Zoom account.

   Scopes are configured on the Zoom OAuth app (User-managed). Required:
     - meeting:write:meeting   (create meetings)
     - user:read:user          (read the connected user's email/id)
   We intentionally do NOT send a `scope` param on the authorize URL — Zoom uses
   the app's configured scopes, and sending a mismatched subset triggers errors.
   =========================================================================== */

export { signState, verifyState };

export function zoomConfig() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI || "http://localhost:3000/api/zoom/callback";
  return { clientId, clientSecret, redirectUri, configured: Boolean(clientId && clientSecret) };
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = zoomConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId!,
    redirect_uri: redirectUri,
    state,
  });
  return `https://zoom.us/oauth/authorize?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string; // Zoom returns one on both authorization_code and refresh_token grants
  expires_in: number;
  scope?: string;
};

function basicAuthHeader(): string {
  const { clientId, clientSecret } = zoomConfig();
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) throw new Error(`Zoom token request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export function exchangeCode(code: string) {
  const { redirectUri } = zoomConfig();
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
}

function refreshAccessToken(refreshToken: string) {
  return tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

type ZoomUser = { id?: string; email?: string };

export async function getZoomUser(accessToken: string): Promise<ZoomUser> {
  const res = await fetch("https://api.zoom.us/v2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Zoom user lookup failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function storeTokens(userId: string, tok: TokenResponse, identity?: ZoomUser) {
  const admin = getSupabaseAdmin();
  // Zoom always returns a refresh_token (rotated each refresh), so a full upsert
  // is always safe — refresh_token is never null.
  const row: Record<string, unknown> = {
    user_id: userId,
    access_token: tok.access_token,
    refresh_token: tok.refresh_token,
    token_expiry: new Date(Date.now() + (tok.expires_in - 60) * 1000).toISOString(),
    scope: tok.scope ?? null,
    updated_at: new Date().toISOString(),
  };
  if (identity?.email) row.zoom_email = identity.email;
  if (identity?.id) row.zoom_user_id = identity.id;
  const { error } = await admin.from("zoom_accounts").upsert(row, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

export async function getConnection(userId: string): Promise<{ connected: boolean; email: string | null }> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("zoom_accounts").select("zoom_email").eq("user_id", userId).maybeSingle();
  return { connected: Boolean(data), email: data?.zoom_email ?? null };
}

export async function disconnect(userId: string) {
  const admin = getSupabaseAdmin();
  await admin.from("zoom_accounts").delete().eq("user_id", userId);
}

/** Returns a valid access token, transparently refreshing if expired. null = not connected. */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("zoom_accounts").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;

  const expired = !data.token_expiry || new Date(data.token_expiry).getTime() < Date.now();
  if (!expired && data.access_token) return data.access_token;

  try {
    const tok = await refreshAccessToken(data.refresh_token);
    await storeTokens(userId, tok);
    return tok.access_token;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[zoom] token refresh failed for user ${userId}: ${msg}`);
    // Only drop the connection when the grant itself is dead. Zoom returns
    // "invalid_grant" when the refresh token has been revoked/expired.
    if (/invalid_grant/i.test(msg)) await disconnect(userId);
    return null;
  }
}

export type ZoomMeeting = { id: number; join_url: string; start_url: string; password?: string };

/** Create a scheduled Zoom meeting on the connected user's account. */
export async function createMeeting(
  accessToken: string,
  opts: { topic: string; startISO: string; durationMin: number; agenda?: string },
): Promise<ZoomMeeting> {
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2, // scheduled meeting
      start_time: opts.startISO, // UTC ISO (ends with Z) → Zoom treats as GMT
      duration: opts.durationMin,
      timezone: "UTC",
      agenda: opts.agenda,
      settings: {
        join_before_host: true,
        waiting_room: false,
        approval_type: 2, // no registration required
      },
    }),
  });
  if (!res.ok) throw new Error(`Zoom createMeeting failed: ${res.status} ${await res.text()}`);
  return res.json();
}
