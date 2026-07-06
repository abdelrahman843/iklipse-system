-- =============================================================================
-- ZOOM INTEGRATION — per-user OAuth token storage
-- Run this ONCE in the Supabase SQL Editor (after schema.sql).
--
-- Mirrors google_accounts. Holds Zoom OAuth refresh/access tokens per user.
-- RLS is enabled and NO privileges are granted to the `authenticated` role, so
-- the browser can never read it. Only the server (service_role, which bypasses
-- RLS) touches it, via /api/zoom/* route handlers. The client learns its own
-- connection status through /api/zoom/status, never by reading tokens.
--
-- NOTE: Zoom ROTATES the refresh_token on every refresh, so the server always
-- writes back the new refresh_token. The column is NOT NULL — every Zoom grant
-- (initial and refresh) returns one, so a full upsert is always safe here.
-- =============================================================================

create table if not exists public.zoom_accounts (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  zoom_email    text,
  zoom_user_id  text,                    -- Zoom account user id ("me" works too)
  access_token  text,
  refresh_token text not null,
  token_expiry  timestamptz,             -- when the current access_token expires
  scope         text,
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.zoom_accounts is
  'Zoom OAuth tokens per user. Server-only; RLS denies all client access.';

-- Enable RLS and grant NOTHING to authenticated/anon → only service_role reaches it.
alter table public.zoom_accounts enable row level security;
revoke all on public.zoom_accounts from anon, authenticated;
-- (No policies are created on purpose. With RLS on and no policies, the
--  authenticated/anon roles are fully denied; service_role bypasses RLS.)
