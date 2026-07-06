-- =============================================================================
-- BOARDS (Trello-style) — Phase 1: schema, permissions, RLS, activity log
-- Run ONCE in the Supabase SQL Editor (after schema.sql). Safe to re-run.
--
-- Permission model (two layers, like Trello workspace × board roles):
--   • Global: super_admin / admin implicitly access ALL boards.
--   • Per board: board_members.board_role ∈ admin|editor|member|commenter|viewer
-- Role mapping when added to a board: manager→editor, member→member, client→viewer.
--   admin     = manage board + members + all content
--   editor    = full content (lists, any card)            ← managers
--   member    = edit ONLY cards they're assigned to/created; comment anywhere
--   commenter = comment only
--   viewer    = read only                                 ← clients
-- =============================================================================

-- 1. ENUM -----------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'board_role') then
    create type public.board_role as enum ('admin', 'editor', 'member', 'commenter', 'viewer');
  end if;
end $$;

-- 2. TABLES ---------------------------------------------------------------------
create table if not exists public.boards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  color       text default '#4a4ec8',
  created_by  uuid references auth.users (id) on delete set null,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.board_members (
  board_id   uuid not null references public.boards (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  board_role public.board_role not null default 'member',
  added_by   uuid references auth.users (id) on delete set null,
  added_at   timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table if not exists public.lists (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards (id) on delete cascade,
  title       text not null,
  position    double precision not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.cards (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid not null references public.boards (id) on delete cascade,
  list_id       uuid not null references public.lists (id) on delete cascade,
  title         text not null,
  description   text,
  position      double precision not null default 0,
  due_date      timestamptz,
  due_complete  boolean not null default false,
  cover_color   text,
  is_archived   boolean not null default false,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.labels (
  id       uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name     text,
  color    text not null
);

create table if not exists public.card_labels (
  card_id  uuid not null references public.cards (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  primary key (card_id, label_id)
);

create table if not exists public.card_assignees (
  card_id     uuid not null references public.cards (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (card_id, user_id)
);

create table if not exists public.checklists (
  id       uuid primary key default gen_random_uuid(),
  card_id  uuid not null references public.cards (id) on delete cascade,
  title    text not null default 'Checklist',
  position double precision not null default 0
);

create table if not exists public.checklist_items (
  id           uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  content      text not null,
  is_done      boolean not null default false,
  position     double precision not null default 0,
  completed_by uuid references auth.users (id) on delete set null,
  completed_at timestamptz
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  card_id    uuid not null references public.cards (id) on delete cascade,
  author_id  uuid not null references auth.users (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards (id) on delete cascade,
  kind        text not null default 'file' check (kind in ('file', 'link')),
  file_name   text not null,
  url         text,          -- for link attachments / signed display url
  storage_path text,         -- for uploaded files (Storage bucket path)
  mime_type   text,
  size_bytes  bigint,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.activity (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  card_id    uuid references public.cards (id) on delete cascade,
  actor_id   uuid references auth.users (id) on delete set null,
  type       text not null,
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  actor_id   uuid references auth.users (id) on delete set null,
  board_id   uuid references public.boards (id) on delete cascade,
  card_id    uuid references public.cards (id) on delete cascade,
  type       text not null,
  data       jsonb not null default '{}',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_board_members_user on public.board_members (user_id);
create index if not exists idx_lists_board on public.lists (board_id);
create index if not exists idx_cards_board on public.cards (board_id);
create index if not exists idx_cards_list on public.cards (list_id);
create index if not exists idx_card_labels_card on public.card_labels (card_id);
create index if not exists idx_card_assignees_card on public.card_assignees (card_id);
create index if not exists idx_card_assignees_user on public.card_assignees (user_id);
create index if not exists idx_checklists_card on public.checklists (card_id);
create index if not exists idx_checklist_items_list on public.checklist_items (checklist_id);
create index if not exists idx_comments_card on public.comments (card_id);
create index if not exists idx_attachments_card on public.attachments (card_id);
create index if not exists idx_activity_board on public.activity (board_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications (user_id, is_read);

-- 3. updated_at touch -----------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_boards_touch on public.boards;
create trigger trg_boards_touch before update on public.boards for each row execute function public.touch_updated_at();
drop trigger if exists trg_cards_touch on public.cards;
create trigger trg_cards_touch before update on public.cards for each row execute function public.touch_updated_at();
drop trigger if exists trg_comments_touch on public.comments;
create trigger trg_comments_touch before update on public.comments for each row execute function public.touch_updated_at();

-- 4. PERMISSION HELPERS (SECURITY DEFINER → bypass RLS, no recursion) -----------
create or replace function public.is_global_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role in ('super_admin','admin') and is_active);
$$;

create or replace function public.board_role_of(p_board uuid)
returns public.board_role language sql stable security definer set search_path = public as $$
  select case
    when public.is_global_admin() then 'admin'::public.board_role
    else (select board_role from public.board_members where board_id = p_board and user_id = auth.uid())
  end;
$$;

create or replace function public.can_view_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.board_role_of(p_board) is not null;
$$;

create or replace function public.can_comment_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.board_role_of(p_board) in ('admin','editor','member','commenter');
$$;

create or replace function public.can_edit_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.board_role_of(p_board) in ('admin','editor');
$$;

create or replace function public.can_admin_board(p_board uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.board_role_of(p_board) = 'admin';
$$;

-- members may edit only cards they're assigned to or created; editors/admins: any
create or replace function public.can_edit_card(p_card uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.can_edit_board(c.board_id) then true
    when public.board_role_of(c.board_id) = 'member'
         and (c.created_by = auth.uid()
              or exists (select 1 from public.card_assignees a where a.card_id = c.id and a.user_id = auth.uid()))
      then true
    else false
  end
  from public.cards c where c.id = p_card;
$$;

-- convenience: board id for a card
create or replace function public.card_board(p_card uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select board_id from public.cards where id = p_card;
$$;

-- 5. ACTIVITY LOG ---------------------------------------------------------------
create or replace function public.log_activity(p_board uuid, p_card uuid, p_type text, p_data jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into public.activity (board_id, card_id, actor_id, type, data)
  values (p_board, p_card, auth.uid(), p_type, coalesce(p_data, '{}'::jsonb));
$$;

create or replace function public.tg_card_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity(new.board_id, new.id, 'card_created', jsonb_build_object('title', new.title));
  elsif tg_op = 'UPDATE' then
    if new.list_id is distinct from old.list_id then
      perform public.log_activity(new.board_id, new.id, 'card_moved',
        jsonb_build_object('from_list', old.list_id, 'to_list', new.list_id));
    end if;
    if new.title is distinct from old.title then
      perform public.log_activity(new.board_id, new.id, 'card_renamed', jsonb_build_object('title', new.title));
    end if;
    if new.description is distinct from old.description then
      perform public.log_activity(new.board_id, new.id, 'description_changed', '{}');
    end if;
    if new.due_date is distinct from old.due_date then
      perform public.log_activity(new.board_id, new.id, 'due_date_changed', jsonb_build_object('due_date', new.due_date));
    end if;
    if new.due_complete is distinct from old.due_complete then
      perform public.log_activity(new.board_id, new.id,
        case when new.due_complete then 'due_completed' else 'due_reopened' end, '{}');
    end if;
    if new.is_archived is distinct from old.is_archived then
      perform public.log_activity(new.board_id, new.id,
        case when new.is_archived then 'card_archived' else 'card_restored' end, '{}');
    end if;
  end if;
  return null;
end $$;
drop trigger if exists trg_card_activity on public.cards;
create trigger trg_card_activity after insert or update on public.cards
  for each row execute function public.tg_card_activity();

create or replace function public.tg_list_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity(new.board_id, null, 'list_created', jsonb_build_object('title', new.title));
  return null;
end $$;
drop trigger if exists trg_list_activity on public.lists;
create trigger trg_list_activity after insert on public.lists
  for each row execute function public.tg_list_activity();

create or replace function public.tg_comment_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  select board_id into b from public.cards where id = new.card_id;
  perform public.log_activity(b, new.card_id, 'comment_added', jsonb_build_object('comment_id', new.id));
  return null;
end $$;
drop trigger if exists trg_comment_activity on public.comments;
create trigger trg_comment_activity after insert on public.comments
  for each row execute function public.tg_comment_activity();

create or replace function public.tg_checklist_item_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare b uuid; c uuid;
begin
  select card_id into c from public.checklists where id = new.checklist_id;
  select board_id into b from public.cards where id = c;
  if new.is_done and not old.is_done then
    perform public.log_activity(b, c, 'checklist_item_completed', jsonb_build_object('content', new.content));
  end if;
  return null;
end $$;
drop trigger if exists trg_checklist_item_activity on public.checklist_items;
create trigger trg_checklist_item_activity after update on public.checklist_items
  for each row execute function public.tg_checklist_item_activity();

create or replace function public.tg_attachment_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  select board_id into b from public.cards where id = new.card_id;
  perform public.log_activity(b, new.card_id, 'attachment_added', jsonb_build_object('file_name', new.file_name));
  return null;
end $$;
drop trigger if exists trg_attachment_activity on public.attachments;
create trigger trg_attachment_activity after insert on public.attachments
  for each row execute function public.tg_attachment_activity();

create or replace function public.tg_assignee_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare b uuid; cid uuid;
begin
  cid := coalesce(new.card_id, old.card_id);
  select board_id into b from public.cards where id = cid;
  if tg_op = 'INSERT' then
    perform public.log_activity(b, cid, 'member_assigned', jsonb_build_object('user_id', new.user_id));
  else
    perform public.log_activity(b, cid, 'member_unassigned', jsonb_build_object('user_id', old.user_id));
  end if;
  return null;
end $$;
drop trigger if exists trg_assignee_activity on public.card_assignees;
create trigger trg_assignee_activity after insert or delete on public.card_assignees
  for each row execute function public.tg_assignee_activity();

create or replace function public.tg_label_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare b uuid; cid uuid;
begin
  cid := coalesce(new.card_id, old.card_id);
  select board_id into b from public.cards where id = cid;
  if tg_op = 'INSERT' then
    perform public.log_activity(b, cid, 'label_added', jsonb_build_object('label_id', new.label_id));
  else
    perform public.log_activity(b, cid, 'label_removed', jsonb_build_object('label_id', old.label_id));
  end if;
  return null;
end $$;
drop trigger if exists trg_label_activity on public.card_labels;
create trigger trg_label_activity after insert or delete on public.card_labels
  for each row execute function public.tg_label_activity();

-- 6. GRANTS + RLS ---------------------------------------------------------------
grant select, insert, update, delete on
  public.boards, public.board_members, public.lists, public.cards, public.labels,
  public.card_labels, public.card_assignees, public.checklists, public.checklist_items,
  public.comments, public.attachments to authenticated;
grant select on public.activity to authenticated;
grant select, update on public.notifications to authenticated;

alter table public.boards            enable row level security;
alter table public.board_members     enable row level security;
alter table public.lists             enable row level security;
alter table public.cards             enable row level security;
alter table public.labels            enable row level security;
alter table public.card_labels       enable row level security;
alter table public.card_assignees    enable row level security;
alter table public.checklists        enable row level security;
alter table public.checklist_items   enable row level security;
alter table public.comments          enable row level security;
alter table public.attachments       enable row level security;
alter table public.activity          enable row level security;
alter table public.notifications     enable row level security;

-- boards
drop policy if exists boards_select on public.boards;
create policy boards_select on public.boards for select to authenticated using (public.can_view_board(id));
drop policy if exists boards_insert on public.boards;
create policy boards_insert on public.boards for insert to authenticated with check (public.is_global_admin() and created_by = auth.uid());
drop policy if exists boards_update on public.boards;
create policy boards_update on public.boards for update to authenticated using (public.can_admin_board(id)) with check (public.can_admin_board(id));
drop policy if exists boards_delete on public.boards;
create policy boards_delete on public.boards for delete to authenticated using (public.can_admin_board(id));

-- board_members
drop policy if exists bm_select on public.board_members;
create policy bm_select on public.board_members for select to authenticated using (public.can_view_board(board_id));
drop policy if exists bm_insert on public.board_members;
create policy bm_insert on public.board_members for insert to authenticated with check (public.can_admin_board(board_id));
drop policy if exists bm_update on public.board_members;
create policy bm_update on public.board_members for update to authenticated using (public.can_admin_board(board_id)) with check (public.can_admin_board(board_id));
drop policy if exists bm_delete on public.board_members;
create policy bm_delete on public.board_members for delete to authenticated using (public.can_admin_board(board_id));

-- lists
drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists for select to authenticated using (public.can_view_board(board_id));
drop policy if exists lists_insert on public.lists;
create policy lists_insert on public.lists for insert to authenticated with check (public.can_edit_board(board_id));
drop policy if exists lists_update on public.lists;
create policy lists_update on public.lists for update to authenticated using (public.can_edit_board(board_id)) with check (public.can_edit_board(board_id));
drop policy if exists lists_delete on public.lists;
create policy lists_delete on public.lists for delete to authenticated using (public.can_edit_board(board_id));

-- cards
drop policy if exists cards_select on public.cards;
create policy cards_select on public.cards for select to authenticated using (public.can_view_board(board_id));
drop policy if exists cards_insert on public.cards;
create policy cards_insert on public.cards for insert to authenticated with check (public.can_edit_board(board_id));
drop policy if exists cards_update on public.cards;
create policy cards_update on public.cards for update to authenticated using (public.can_edit_card(id)) with check (public.can_edit_card(id));
drop policy if exists cards_delete on public.cards;
create policy cards_delete on public.cards for delete to authenticated using (public.can_edit_board(board_id));

-- labels
drop policy if exists labels_select on public.labels;
create policy labels_select on public.labels for select to authenticated using (public.can_view_board(board_id));
drop policy if exists labels_write on public.labels;
create policy labels_write on public.labels for all to authenticated using (public.can_edit_board(board_id)) with check (public.can_edit_board(board_id));

-- card_labels
drop policy if exists card_labels_select on public.card_labels;
create policy card_labels_select on public.card_labels for select to authenticated using (public.can_view_board(public.card_board(card_id)));
drop policy if exists card_labels_write on public.card_labels;
create policy card_labels_write on public.card_labels for all to authenticated using (public.can_edit_card(card_id)) with check (public.can_edit_card(card_id));

-- card_assignees (managers/admins assign)
drop policy if exists assignees_select on public.card_assignees;
create policy assignees_select on public.card_assignees for select to authenticated using (public.can_view_board(public.card_board(card_id)));
drop policy if exists assignees_write on public.card_assignees;
create policy assignees_write on public.card_assignees for all to authenticated using (public.can_edit_board(public.card_board(card_id))) with check (public.can_edit_board(public.card_board(card_id)));

-- checklists
drop policy if exists checklists_select on public.checklists;
create policy checklists_select on public.checklists for select to authenticated using (public.can_view_board(public.card_board(card_id)));
drop policy if exists checklists_write on public.checklists;
create policy checklists_write on public.checklists for all to authenticated using (public.can_edit_card(card_id)) with check (public.can_edit_card(card_id));

-- checklist_items
drop policy if exists items_select on public.checklist_items;
create policy items_select on public.checklist_items for select to authenticated
  using (public.can_view_board(public.card_board((select card_id from public.checklists where id = checklist_id))));
drop policy if exists items_write on public.checklist_items;
create policy items_write on public.checklist_items for all to authenticated
  using (public.can_edit_card((select card_id from public.checklists where id = checklist_id)))
  with check (public.can_edit_card((select card_id from public.checklists where id = checklist_id)));

-- comments (comment anywhere you can comment; edit/delete own)
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated using (public.can_view_board(public.card_board(card_id)));
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.can_comment_board(public.card_board(card_id)));
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.can_admin_board(public.card_board(card_id)));

-- attachments
drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments for select to authenticated using (public.can_view_board(public.card_board(card_id)));
drop policy if exists attachments_insert on public.attachments;
create policy attachments_insert on public.attachments for insert to authenticated
  with check (uploaded_by = auth.uid() and public.can_edit_card(card_id));
drop policy if exists attachments_delete on public.attachments;
create policy attachments_delete on public.attachments for delete to authenticated
  using (uploaded_by = auth.uid() or public.can_edit_board(public.card_board(card_id)));

-- activity (read-only to clients; writes happen via SECURITY DEFINER triggers)
drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity for select to authenticated using (public.can_view_board(board_id));

-- notifications (own only)
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
