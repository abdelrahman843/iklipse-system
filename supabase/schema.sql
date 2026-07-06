-- =============================================================================
-- IKLIPSE CENTRAL HUB — Supabase auth + role model
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every object uses "if not exists" / "or replace" / drop-guard.
--
-- Model: 5 application roles — 'super_admin', 'admin', 'manager', 'member',
--        'client'. "Admin powers" (create users, full access) = super_admin OR
--        admin; see public.is_admin().
-- Auth:  Supabase Auth (email + password) issues a JWT. The client sends it as
--        `Authorization: Bearer <access_token>` to PostgREST; RLS enforces access.
-- =============================================================================


-- 1. ROLE TYPE -----------------------------------------------------------------
-- A Postgres enum keeps roles constrained at the database level.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum
      ('super_admin', 'admin', 'manager', 'member', 'client');
  end if;
end$$;


-- 2. PROFILES TABLE ------------------------------------------------------------
-- One row per auth user (1:1 with auth.users). This is the "system of record"
-- for who someone is and what role they hold. auth.users itself stays managed
-- by Supabase (passwords, email, sessions) — we never write to it directly.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  username    text unique,
  role        public.app_role not null default 'member',
  is_active   boolean not null default true,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Application profile + role for each Supabase auth user.';


-- 3. HELPER FUNCTIONS ----------------------------------------------------------
-- SECURITY DEFINER so they can read profiles without tripping the table''s own
-- RLS (this is what prevents the classic "infinite recursion in policy" error).

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super_admin', 'admin') and is_active
  );
$$;


-- 4. AUTO-CREATE PROFILE ON SIGNUP --------------------------------------------
-- When an admin creates a user via the Admin API, Supabase inserts into
-- auth.users; this trigger mirrors them into public.profiles, reading the
-- role/name/username passed in user_metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, username, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5. PRIVILEGE-ESCALATION GUARD -----------------------------------------------
-- RLS can gate WHICH rows you may update, but not WHICH columns. Without this,
-- a team_member could update their own row and set role = 'admin'. This trigger
-- blocks any change to role / is_active unless the caller is an admin.
create or replace function public.protect_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only restrict logged-in end-users. When auth.uid() is null the change comes
  -- from the SQL Editor / service_role (trusted), so allow it.
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change role or active status';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_privileged_columns();


-- 6. ROW LEVEL SECURITY --------------------------------------------------------
alter table public.profiles enable row level security;

-- Grants are required IN ADDITION to policies (RLS narrows what these allow).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- SELECT: a user sees their own profile; admins see everyone.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

-- UPDATE: a user may edit their own profile (the column guard above stops them
-- from touching role/is_active); admins may edit anyone.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT / DELETE of profiles is admin-only. (Normal inserts happen via the
-- signup trigger, which runs as definer and bypasses these.)
drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin on public.profiles
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());


-- 7. REUSABLE PATTERN FOR YOUR OTHER TABLES -----------------------------------
-- When you add domain tables (tasks, clients, leads, salary…), follow this shape
-- so authorization stays centralized in the helper functions:
--
--   alter table public.tasks enable row level security;
--   grant select, insert, update, delete on public.tasks to authenticated;
--
--   -- admins: full access
--   create policy tasks_admin on public.tasks for all to authenticated
--     using (public.is_admin()) with check (public.is_admin());
--
--   -- team members: read all, write where they are the assignee
--   create policy tasks_team_read on public.tasks for select to authenticated
--     using (public.current_app_role() = 'member');
--
--   -- clients: only rows belonging to their own client account
--   create policy tasks_client_read on public.tasks for select to authenticated
--     using (public.current_app_role() = 'client' and client_owner = auth.uid());
--
-- (We'll define the real per-role rules once you specify Team Member / Client
--  permissions — this file already has the primitives they'll build on.)


-- 8. (OPTIONAL) ROLE INSIDE THE JWT -------------------------------------------
-- By default the role lives only in the profiles table. If you want the role
-- embedded directly in the Bearer token's claims (so a gateway / external API
-- can authorize without a DB lookup), enable a Custom Access Token Hook:
--   Dashboard → Authentication → Hooks → Custom Access Token → select this fn.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  select role into user_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';
  if user_role is not null then
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_role));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;
-- If you enable the hook, you can then write RLS like:
--   using ( (auth.jwt() ->> 'app_role') = 'admin' )


-- 9. SEED THE FIRST ADMIN ------------------------------------------------------
-- You cannot create an auth user from SQL (passwords are hashed by Auth). So:
--   1) Dashboard → Authentication → Users → "Add user" (set email + password).
--   2) Then run the line below with that email to promote them to admin:
--
-- update public.profiles set role = 'admin' where email = 'you@iklipseworld.com';
-- =============================================================================
