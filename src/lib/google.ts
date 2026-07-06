import "server-only";

import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/* ===========================================================================
   Google Calendar OAuth + API helpers (server-only, dependency-light).
   Uses raw fetch against Google's OAuth + Calendar REST endpoints — no
   googleapis SDK. Tokens live in public.google_accounts (RLS-locked).
   =========================================================================== */

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly", // read events + free/busy
  "https://www.googleapis.com/auth/calendar.events",   // create/edit events (scheduling)
  "openid",
  "email",
];

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";
  return { clientId, clientSecret, redirectUri, configured: Boolean(clientId && clientSecret) };
}

/* --- signed `state` so we can trust the user id at the OAuth callback ------- */
const stateSecret = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-secret";

export function signState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString();
    const i = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, i);
    const sig = decoded.slice(i + 1);
    const expected = crypto.createHmac("sha256", stateSecret()).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const [userId, ts] = payload.split(".");
    if (Date.now() - Number(ts) > 10 * 60 * 1000) return null; // 10-minute window
    return userId;
  } catch {
    return null;
  }
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = googleConfig();
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // request a refresh token
    prompt: "consent", // force refresh token issuance on reconnect
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export function exchangeCode(code: string) {
  const { clientId, clientSecret, redirectUri } = googleConfig();
  return tokenRequest({
    code,
    client_id: clientId!,
    client_secret: clientSecret!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
}

function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = googleConfig();
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: clientId!,
    client_secret: clientSecret!,
    grant_type: "refresh_token",
  });
}

function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString());
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export async function storeTokens(userId: string, tok: TokenResponse) {
  const admin = getSupabaseAdmin();
  const row: Record<string, unknown> = {
    user_id: userId,
    access_token: tok.access_token,
    token_expiry: new Date(Date.now() + (tok.expires_in - 60) * 1000).toISOString(),
    scope: tok.scope ?? null,
    updated_at: new Date().toISOString(),
  };
  if (tok.refresh_token) row.refresh_token = tok.refresh_token;
  const email = emailFromIdToken(tok.id_token);
  if (email) row.google_email = email;
  const { error } = await admin.from("google_accounts").upsert(row, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

export async function getConnection(userId: string): Promise<{ connected: boolean; email: string | null }> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("google_accounts").select("google_email").eq("user_id", userId).maybeSingle();
  return { connected: Boolean(data), email: data?.google_email ?? null };
}

export async function disconnect(userId: string) {
  const admin = getSupabaseAdmin();
  await admin.from("google_accounts").delete().eq("user_id", userId);
}

/** Returns a valid access token, transparently refreshing if expired. null = not connected. */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("google_accounts").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;

  const expired = !data.token_expiry || new Date(data.token_expiry).getTime() < Date.now();
  if (!expired && data.access_token) return data.access_token;

  if (!data.refresh_token) {
    // No refresh token was ever stored (consent granted without access_type=offline
    // or without prompt=consent). Nothing to refresh with → force a reconnect.
    console.error(`[google] no refresh_token stored for user ${userId}; forcing reconnect`);
    await disconnect(userId);
    return null;
  }

  try {
    const tok = await refreshAccessToken(data.refresh_token);
    await storeTokens(userId, tok);
    return tok.access_token;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[google] token refresh failed for user ${userId}: ${msg}`);
    // Only drop the connection when Google says the grant itself is dead
    // (invalid_grant = revoked / expired refresh token, e.g. Testing-mode 7-day
    // expiry). For transient failures (network, invalid_client from a missing
    // secret, rate limits) keep the row so a config fix restores it without a
    // full reconnect.
    if (/invalid_grant/i.test(msg)) await disconnect(userId);
    return null;
  }
}

export type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
  organizer?: { email?: string; displayName?: string };
};

export type BusyInterval = { start: string; end: string };

export async function freeBusy(accessToken: string, timeMin: string, timeMax: string): Promise<BusyInterval[]> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: "primary" }] }),
  });
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return (j.calendars?.primary?.busy ?? []) as BusyInterval[];
}

export async function createEvent(
  accessToken: string,
  opts: { summary: string; description?: string; location?: string; startISO: string; endISO: string; attendees: string[]; addMeet: boolean },
): Promise<{ htmlLink?: string; hangoutLink?: string; id: string }> {
  const body: Record<string, unknown> = {
    summary: opts.summary,
    description: opts.description,
    location: opts.location,
    start: { dateTime: opts.startISO },
    end: { dateTime: opts.endISO },
    attendees: opts.attendees.map((email) => ({ email })),
  };
  let url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all";
  if (opts.addMeet) {
    url += "&conferenceDataVersion=1";
    body.conferenceData = {
      createRequest: { requestId: `iklipse-${opts.startISO}-${opts.attendees.length}`, conferenceSolutionKey: { type: "hangoutsMeet" } },
    };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createEvent failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function listEvents(accessToken: string, timeMin: string, timeMax: string): Promise<GoogleEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Calendar API failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return (json.items ?? []) as GoogleEvent[];
}
