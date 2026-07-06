-- =============================================================================
-- GOOGLE CALENDAR INTEGRATION — per-user OAuth token storage
-- Run this ONCE in the Supabase SQL Editor (after schema.sql).
--
-- Security model: this table holds Google OAuth refresh/access tokens. RLS is
-- enabled and NO privileges are granted to the `authenticated` role, so the
-- browser can never read it. Only the server (service_role, which bypasses RLS)
-- touches it, via /api/google/* route handlers. The client learns its own
-- connection status through /api/google/status, never by reading tokens.
-- =============================================================================

create table if not exists public.google_accounts (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  google_email  text,
  access_token  text,
  refresh_token text not null,
  token_expiry  timestamptz,             -- when the current access_token expires
  scope         text,
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.google_accounts is
  'Google OAuth tokens per user. Server-only; RLS denies all client access.';

-- Enable RLS and grant NOTHING to authenticated/anon → only service_role reaches it.
alter table public.google_accounts enable row level security;
revoke all on public.google_accounts from anon, authenticated;
-- (No policies are created on purpose. With RLS on and no policies, the
--  authenticated/anon roles are fully denied; service_role bypasses RLS.)
