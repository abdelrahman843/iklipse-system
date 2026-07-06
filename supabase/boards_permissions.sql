-- =============================================================================
-- BOARDS — permission redesign (run AFTER boards.sql; re-runnable)
--
-- New model:
--   • super_admin / admin / manager  → "board superusers": full access to ALL
--     boards (view, create, edit, delete, manage lists + list members + cards).
--   • member  → access ONLY to lists they are assigned to (public.list_members).
--     Within an assigned list they have FULL edit (create/edit/move/delete cards,
--     checklists, comments, attachments, assignees). They never see other lists.
--   • client  → NO board access, ever.
--
-- Helpers are redefined in place, so existing policies that call them update
-- automatically; only the policies that must become list-scoped are recreated.
-- =============================================================================

-- 1. list assignment table -----------------------------------------------------
create table if not exists public.list_members (
  list_id  uuid not null references public.lists (id) on delete cascade,
  user_id  uuid not null references auth.users (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (list_id, user_id)
);
create index if not exists idx_list_members_user on public.list_members (user_id);
grant select, insert, update, delete on public.list_members to authenticated;
alter table public.list_members enable row level security;

-- 2. helpers -------------------------------------------------------------------
create or replace function public.app_role_of()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create or replace function public.is_board_superuser()
returns boolean language sql stable security definer set search_path = public as $$
  select public.app_role_of() in ('super_admin','admin','manager');
$$;

create or replace function public.is_list_member(p_list uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.list_members where list_id = p_list and user_id = auth.uid());
$$;

create or replace function public.can_view_list(p_list uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.app_role_of() = 'client' then false
    when public.is_board_superuser() then true
    else public.is_list_member(p_list)
  end;
$$;

-- members get FULL edit inside their assigned lists → edit == view for them
create or replace function public.can_edit_list(p_list uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_view_list(p_list);
$$;

create or replace function public.can_view_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.app_role_of() = 'client' then false
    when public.is_board_superuser() then true
    else exists (
      select 1 from public.list_members lm join public.lists l on l.id = lm.list_id
      where l.board_id = p_board and lm.user_id = auth.uid()
    )
  end;
$$;

-- board-level management (lists, settings, members) = superusers only
create or replace function public.can_edit_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_board_superuser();
$$;
create or replace function public.can_admin_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_board_superuser();
$$;
create or replace function public.can_comment_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_view_board(p_board);
$$;

create or replace function public.can_view_card(p_card uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_view_list((select list_id from public.cards where id = p_card));
$$;
create or replace function public.can_edit_card(p_card uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_edit_list((select list_id from public.cards where id = p_card));
$$;

-- board creation widened to superusers (managers included)
create or replace function public.is_global_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_board_superuser();
$$;

-- 3. list-scoped policies ------------------------------------------------------
-- lists: members see only assigned lists; only superusers manage lists
drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists for select to authenticated using (public.can_view_list(id));

-- cards: scope by their list
drop policy if exists cards_select on public.cards;
create policy cards_select on public.cards for select to authenticated using (public.can_view_card(id));
drop policy if exists cards_insert on public.cards;
create policy cards_insert on public.cards for insert to authenticated with check (public.can_edit_list(list_id));
drop policy if exists cards_delete on public.cards;
create policy cards_delete on public.cards for delete to authenticated using (public.can_edit_card(id));
-- cards_update already gated by can_edit_card (redefined) — left as-is.

-- child tables: SELECT scoped to viewable cards
drop policy if exists card_labels_select on public.card_labels;
create policy card_labels_select on public.card_labels for select to authenticated using (public.can_view_card(card_id));

drop policy if exists assignees_select on public.card_assignees;
create policy assignees_select on public.card_assignees for select to authenticated using (public.can_view_card(card_id));
drop policy if exists assignees_write on public.card_assignees;
create policy assignees_write on public.card_assignees for all to authenticated
  using (public.can_edit_card(card_id)) with check (public.can_edit_card(card_id));

drop policy if exists checklists_select on public.checklists;
create policy checklists_select on public.checklists for select to authenticated using (public.can_view_card(card_id));

drop policy if exists items_select on public.checklist_items;
create policy items_select on public.checklist_items for select to authenticated
  using (public.can_view_card((select card_id from public.checklists where id = checklist_id)));

drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated using (public.can_view_card(card_id));
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.can_view_card(card_id));

drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments for select to authenticated using (public.can_view_card(card_id));
drop policy if exists attachments_delete on public.attachments;
create policy attachments_delete on public.attachments for delete to authenticated
  using (uploaded_by = auth.uid() or public.can_edit_card(card_id));

drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity for select to authenticated
  using (public.is_board_superuser() or (card_id is not null and public.can_view_card(card_id)));

-- list_members: viewable by anyone who can see the list; managed by superusers
drop policy if exists list_members_select on public.list_members;
create policy list_members_select on public.list_members for select to authenticated using (public.can_view_list(list_id));
drop policy if exists list_members_write on public.list_members;
create policy list_members_write on public.list_members for all to authenticated
  using (public.is_board_superuser()) with check (public.is_board_superuser());

-- 4. directory + assignable staff ---------------------------------------------
create or replace function public.directory()
returns table (id uuid, full_name text, username text, avatar_url text, role public.app_role)
language sql stable security definer set search_path = public as $$
  select distinct p.id, p.full_name, p.username, p.avatar_url, p.role
  from public.profiles p
  where p.is_active and (
    public.is_board_superuser()
    or p.id = auth.uid()
    or exists (
      select 1 from public.list_members a join public.list_members b on a.list_id = b.list_id
      where a.user_id = auth.uid() and b.user_id = p.id
    )
  );
$$;

-- superusers only: the pool of people who can be assigned to lists (no clients)
create or replace function public.assignable_staff()
returns table (id uuid, full_name text, username text, avatar_url text, role public.app_role)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.username, p.avatar_url, p.role
  from public.profiles p
  where p.is_active and p.role <> 'client' and public.is_board_superuser();
$$;
grant execute on function public.assignable_staff() to authenticated;
